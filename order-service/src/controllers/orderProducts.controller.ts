import type { Request, Response } from 'express';
import { db } from '../db.js';
import type { RowDataPacket } from 'mysql2';
import { z } from 'zod';

// Esquemas de validación para productos de órdenes
// Helpers de autorización y estado para reducir duplicación y mejorar claridad
// - hasOrderAccess: acceso si es ADMINISTRADOR o dueño de la orden
// - isOrderPending: exige estado 'pendiente' para permitir mutaciones
function hasOrderAccess(
  order: RowDataPacket,
  userId: number,
  isAdmin: boolean
): boolean {
  return isAdmin || order.user_id === userId;
}

function isOrderPending(order: RowDataPacket): boolean {
  return order.estado === 'pendiente';
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
  res: Response
): Promise<Response | void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const validatedData = addProductSchema.parse(req.body);
    // Normalizamos `usuario_id` a number para comparación con `orderRow.user_id`.
    const usuario_id = Number(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    // Tras verificar que hay filas, `orderRow` no es nulo.
    const orderRow = order[0]!;

    if (!hasOrderAccess(orderRow, usuario_id, isAdmin)) {
      return res.status(403).json({
        message: 'No tienes permisos para modificar esta orden',
      });
    }

    // Solo se pueden agregar productos a órdenes pendientes
    if (!isOrderPending(orderRow)) {
      return res.status(400).json({
        message: 'Solo se pueden agregar productos a órdenes pendientes',
      });
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
      // Si no existe, crear nuevo producto.
      // Exigimos explícitamente nombre y precio para evitar defaults aleatorios.
      if (
        validatedData.precio === undefined ||
        validatedData.nombre === undefined
      ) {
        return res.status(400).json({
          message:
            'Para agregar un nuevo producto, se requiere "nombre" y "precio"',
        });
      }

      const precio = validatedData.precio;
      const descuento = validatedData.descuento ?? 0;
      const nombre = validatedData.nombre;
      const marca = validatedData.marca ?? 'Marca Genérica';
      const modelo = validatedData.modelo ?? 'Modelo Genérico';
      const imagen =
        validatedData.imagen ?? 'https://example.com/images/placeholder.jpg';

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
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al agregar producto a la orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Actualizar producto en una orden
 * @param req - Request con IDs y datos a actualizar
 * @param res - Response con confirmación
 */
export async function updateProductInOrder(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { id, productId } = productIdSchema.parse(req.params);
    const validatedData = updateProductSchema.parse(req.body);
    // `usuario_id` se normaliza a number por consistencia tipada.
    const usuario_id = Number(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const orderRow = order[0]!; // no nulo
    if (!hasOrderAccess(orderRow, usuario_id, isAdmin)) {
      return res.status(403).json({
        message: 'No tienes permisos para modificar esta orden',
      });
    }

    // Solo se pueden modificar productos en órdenes pendientes
    if (!isOrderPending(orderRow)) {
      return res.status(400).json({
        message: 'Solo se pueden modificar productos en órdenes pendientes',
      });
    }

    // Verificar que el producto existe en la orden
    const [product] = await db.query<RowDataPacket[]>(
      'SELECT orden_productos_id FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, productId]
    );

    if (product.length === 0) {
      return res
        .status(404)
        .json({ message: 'Producto no encontrado en la orden' });
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
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    if (!product[0]) {
      return res
        .status(404)
        .json({ message: 'Producto no encontrado en la orden' });
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
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al actualizar producto en la orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Eliminar producto de una orden
 * @param req - Request con IDs del producto y orden
 * @param res - Response con confirmación
 */
export async function removeProductFromOrder(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { id, productId } = productIdSchema.parse(req.params);
    const usuario_id = Number(req.auth!.id); // normalizado a number
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const orderRow = order[0]!;
    if (!hasOrderAccess(orderRow, usuario_id, isAdmin)) {
      return res.status(403).json({
        message: 'No tienes permisos para modificar esta orden',
      });
    }

    // Solo se pueden eliminar productos de órdenes pendientes
    if (!isOrderPending(orderRow)) {
      return res.status(400).json({
        message: 'Solo se pueden eliminar productos de órdenes pendientes',
      });
    }

    // Verificar que el producto existe en la orden
    const [product] = await db.query<RowDataPacket[]>(
      'SELECT orden_productos_id FROM order_products WHERE orden_id = ? AND producto_id = ?',
      [id, productId]
    );

    if (product.length === 0) {
      return res
        .status(404)
        .json({ message: 'Producto no encontrado en la orden' });
    }

    // Verificar que no sea el único producto (una orden debe tener al menos un producto)
    const [productCount] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM order_products WHERE orden_id = ?',
      [id]
    );

    if (!productCount[0] || productCount[0].total <= 1) {
      return res.status(400).json({
        message:
          'No se puede eliminar el único producto de la orden. Elimina la orden completa si es necesario.',
      });
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
      return res.status(400).json({
        message: 'IDs inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al eliminar producto de la orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Obtener productos de una orden específica
 * @param req - Request con ID de la orden
 * @param res - Response con lista de productos
 */
export async function getOrderProducts(
  req: Request,
  res: Response
): Promise<Response | void> {
  try {
    const { id } = idParamSchema.parse(req.params);
    const usuario_id = Number(req.auth!.id); // normalizado a number
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe y pertenece al usuario
    const [order] = await db.query<RowDataPacket[]>(
      'SELECT user_id FROM orders WHERE orden_id = ?',
      [id]
    );

    if (order.length === 0) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    const orderRow = order[0]!;

    if (!hasOrderAccess(orderRow, usuario_id, isAdmin)) {
      return res.status(403).json({
        message: 'No tienes permisos para ver esta orden',
      });
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
      return res.status(400).json({
        message: 'ID inválido',
        errors: error.errors,
      });
    }
    console.error('Error al obtener productos de la orden:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}