import type { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { getCatalogProductsByIds } from '../services/productCatalog.js';
import { errors } from '../utils/httpError.js';

const FALLBACK_PRODUCT_IMAGE = 'https://example.com/images/placeholder.jpg';

// Esquemas de validación para productos de órdenes
// Helpers de autorización y estado para reducir duplicación y mejorar claridad
// - hasOrderAccess: acceso si es ADMINISTRADOR o dueño de la orden
// - isOrderPending: exige estado 'en_proceso' para permitir mutaciones
function hasOrderAccess(
  order: RowDataPacket,
  userId: string,
  isAdmin: boolean
): boolean {
  const ownerId = String(order.user_id);
  return isAdmin || ownerId === userId;
}

function isOrderPending(order: RowDataPacket): boolean {
  return order.estado === 'en_proceso';
}
// Valida el parámetro `id` de la orden. Usa `coerce` para convertir strings numéricos.
const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Valida el cuerpo para agregar un producto a una orden.
// `nombre` y `precio` se exigirán si el producto no existía en la orden.
const addProductSchema = z.object({
  producto_id: z.coerce.number().int().positive(),
  cantidad: z.coerce.number().int().positive(),
  // Estos campos pueden ser opcionales en el payload, pero se requerirán
  // explícitamente si el producto no existe aún en la orden.
  precio: z.number().positive().optional(),
  nombre: z.string().min(1).max(300).optional(),
  descuento: z.number().min(0).max(100).optional(),
  marca: z.string().min(1).max(100).optional(),
  modelo: z.string().min(1).max(100).optional(),
  imagen: z.string().url().optional(),
});

// Valida el cuerpo para actualizar un producto en una orden.
// Construye un UPDATE dinámico con los campos presentes.
const updateProductSchema = z.object({
  cantidad: z.coerce.number().int().positive().optional(),
  precio: z.coerce.number().positive().optional(),
  descuento: z.number().min(0).max(100).optional(),
});

// Valida los parámetros de ruta para operaciones sobre un producto concreto.
const productIdSchema = z.object({
  id: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
});

/**
 * Agregar producto a una orden existente
 * @param req - Request con ID de orden y datos del producto
 * @param res - Response con el producto agregado
 */
export async function addProductToOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = addProductSchema.parse(req.body);
    // Normalizamos el identificador autenticado como cadena para comparaciones
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    // Tras verificar que hay filas, `orderRow` no es nulo.
    const orderRow = order[0]!;

    if (!hasOrderAccess(orderRow, authenticatedUserId, isAdmin)) {
      return next(
        errors.forbidden('No tienes permisos para modificar esta orden')
      );
    }

    // Solo se pueden agregar productos a órdenes en proceso
    if (!isOrderPending(orderRow)) {
      return next(
        errors.conflict('Solo se pueden agregar productos a órdenes en proceso')
      );
    }

    // Verificar si el producto ya existe en la orden
    const [existingProduct] = await db.query<RowDataPacket[]>(
      'SELECT orden_productos_id, cantidad FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, validatedData.producto_id]
    );

    if (existingProduct.length > 0 && existingProduct[0]) {
      // Si ya existe, actualizar la cantidad sumando la nueva cantidad
      const newQuantity = existingProduct[0].cantidad + validatedData.cantidad;
      await db.query(
        'UPDATE order_products SET cantidad = ? WHERE orden_productos_id = ?',
        [newQuantity, existingProduct[0].orden_productos_id]
      );
    } else {
      // Si no existe, buscamos detalles en el catálogo local para evitar datos inconsistentes
      const catalog = await getCatalogProductsByIds([
        validatedData.producto_id,
      ]);
      const catalogEntry = catalog.get(validatedData.producto_id);

      const precio = validatedData.precio ?? catalogEntry?.precio ?? undefined;
      const nombre = validatedData.nombre ?? catalogEntry?.nombre ?? undefined;

      if (precio === undefined || nombre === undefined) {
        return next(
          errors.validation(
            'El producto no existe en la orden y no se encontraron datos suficientes en el catálogo'
          )
        );
      }

      const descuento = validatedData.descuento ?? catalogEntry?.descuento ?? 0;
      const marca =
        validatedData.marca ?? catalogEntry?.marca ?? 'Marca Genérica';
      const modelo =
        validatedData.modelo ?? catalogEntry?.modelo ?? 'Modelo Genérico';
      const imagen =
        validatedData.imagen ?? catalogEntry?.imagen ?? FALLBACK_PRODUCT_IMAGE;

      await db.query(
        `INSERT INTO order_products (orden_id, producto_id, nombre, precio, descuento, marca, modelo, cantidad, imagen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          validatedData.producto_id,
          nombre,
          precio,
          descuento,
          marca,
          modelo,
          validatedData.cantidad,
          imagen,
        ]
      );
    }

    // El trigger automáticamente recalculará el total
    res
      .status(200)
      .json({ message: 'Producto agregado exitosamente a la orden' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'Datos inválidos',
        details: error.errors,
      });
    }
    return next(error);
  }
}

/**
 * Actualizar producto en una orden
 * @param req - Request con IDs y datos a actualizar
 * @param res - Response con confirmación
 */
export async function updateProductInOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id, productId } = productIdSchema.parse(req.params);
    const validatedData = updateProductSchema.parse(req.body);
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    const orderRow = order[0]!; // no nulo
    if (!hasOrderAccess(orderRow, authenticatedUserId, isAdmin)) {
      return next(
        errors.forbidden('No tienes permisos para modificar esta orden')
      );
    }

    // Solo se pueden modificar productos en órdenes en proceso
    if (!isOrderPending(orderRow)) {
      return next(
        errors.conflict(
          'Solo se pueden modificar productos en órdenes en proceso'
        )
      );
    }

    // Verificar que el producto existe en la orden
    const [product] = await db.query<RowDataPacket[]>(
      'SELECT orden_productos_id FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, productId]
    );

    if (product.length === 0) {
      return next(errors.notFound('Producto no encontrado en la orden'));
    }

    // Construir consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (validatedData.cantidad !== undefined) {
      updateFields.push('cantidad = ?');
      updateValues.push(validatedData.cantidad);
    }

    if (validatedData.precio !== undefined) {
      updateFields.push('precio = ?');
      updateValues.push(validatedData.precio);
    }

    if (validatedData.descuento !== undefined) {
      updateFields.push('descuento = ?');
      updateValues.push(validatedData.descuento);
    }

    if (updateFields.length === 0) {
      return next(errors.validation('No hay campos para actualizar'));
    }

    if (!product[0]) {
      return next(errors.notFound('Producto no encontrado en la orden'));
    }

    updateValues.push(product[0].orden_productos_id);

    // Actualizar el producto
    await db.query(
      `UPDATE order_products SET ${updateFields.join(
        ', '
      )} WHERE orden_productos_id = ?`,
      updateValues
    );

    // El trigger automáticamente recalculará el total
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'Datos inválidos',
        details: error.errors,
      });
    }
    return next(error);
  }
}

/**
 * Eliminar producto de una orden
 * @param req - Request con IDs del producto y orden
 * @param res - Response con confirmación
 */
export async function removeProductFromOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id, productId } = productIdSchema.parse(req.params);
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    const orderRow = order[0]!;
    if (!hasOrderAccess(orderRow, authenticatedUserId, isAdmin)) {
      return next(
        errors.forbidden('No tienes permisos para modificar esta orden')
      );
    }

    // Solo se pueden eliminar productos de órdenes en proceso
    if (!isOrderPending(orderRow)) {
      return next(
        errors.conflict(
          'Solo se pueden eliminar productos de órdenes en proceso'
        )
      );
    }

    // Verificar que el producto existe en la orden
    const [product] = await db.query<RowDataPacket[]>(
      'SELECT orden_productos_id FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, productId]
    );

    if (product.length === 0) {
      return next(errors.notFound('Producto no encontrado en la orden'));
    }

    // Verificar que no sea el único producto (una orden debe tener al menos un producto)
    const [productCount] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM order_products WHERE orden_id = ?',
      [id]
    );

    if (!productCount[0] || productCount[0].total <= 1) {
      return next(
        errors.conflict(
          'No se puede eliminar el único producto de la orden. Elimina la orden completa si es necesario.'
        )
      );
    }

    // Eliminar el producto
    await db.query(
      'DELETE FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, productId]
    );

    // El trigger automáticamente recalculará el total
    res
      .status(200)
      .json({ message: 'Producto eliminado exitosamente de la orden' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'IDs inválidos',
        details: error.errors,
      });
    }
    return next(error);
  }
}

/**
 * Obtener productos de una orden específica
 * @param req - Request con ID de la orden
 * @param res - Response con lista de productos
 */
export async function getOrderProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    const orderRow = order[0]!;

    if (!hasOrderAccess(orderRow, authenticatedUserId, isAdmin)) {
      return next(errors.forbidden('No tienes permisos para ver esta orden'));
    }

    // Obtener productos de la orden
    // Consulta con cálculo de `subtotal` por producto
    const [products] = await db.query<RowDataPacket[]>(
      `SELECT 
        orden_productos_id,
        producto_id,
        nombre,
        precio,
        descuento,
        marca,
        modelo,
        cantidad,
        imagen,
        (precio * cantidad * (1 - descuento/100)) as subtotal
      FROM order_products 
      WHERE orden_id = ?
      ORDER BY orden_productos_id`,
      [id]
    );

    // Resumen agregado para facilitar consumo del cliente
    res.status(200).json({
      data: products,
      total_productos: products.length,
      total_items: products.reduce(
        (sum: number, p: any) => sum + p.cantidad,
        0
      ),
      subtotal_orden: products.reduce(
        (sum: number, p: any) => sum + p.subtotal,
        0
      ),
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'ID inválido',
        details: error.errors,
      });
    }
    return next(error);
  }
}
