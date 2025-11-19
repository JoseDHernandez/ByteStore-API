import type { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type {
  Order,
  OrderProduct,
  OrderResponseDTO,
  OrdersPaginatedResponse,
} from '../types/order.js';
import {
  createOrderSchema,
  updateOrderSchema,
  orderIdSchema,
  ordersQuerySchema,
} from '../schemas/order.schema.js';
import {
  ORDER_PRODUCTS_SELECT_FIELDS,
  ORDER_SELECT_FIELDS,
} from '../utils/sql.js';
import { computePagination } from '../utils/pagination.js';
import {
  calculateShippingCost,
  type ShippingInput,
} from '../utils/shipping.js';
import { getCatalogProductsByIds } from '../services/productCatalog.js';
import { errors } from '../utils/httpError.js';

// Tipos auxiliares: filas de MySQL enriquecidas con el modelo del dominio
type OrderRow = RowDataPacket & Order;
type OrderProductRow = RowDataPacket & OrderProduct;

/**
 * Crea una orden y sus productos en transacción.
 * Verifica permisos del usuario y retorna la orden completa.
 * @param req Request con datos de la orden
 * @param res Response con la orden creada
 */
export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // Validar datos de entrada
    const validatedData = createOrderSchema.parse(req.body);
    const authenticatedUserId = String(req.auth!.id);
    const requestUserId = String(validatedData.user_id).trim();
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que el usuario puede crear la orden (debe ser el mismo usuario o admin)
    if (!isAdmin && requestUserId !== authenticatedUserId) {
      return next(
        errors.forbidden(
          'No tienes permisos para crear una orden para otro usuario'
        )
      );
    }

    // Obtener catálogo de productos para los IDs solicitados
    const productIds = validatedData.productos.map(
      (producto) => producto.producto_id
    );
    const catalog = await getCatalogProductsByIds(productIds);

    const missingIds = productIds.filter((id) => !catalog.has(id));
    if (missingIds.length > 0) {
      return next(
        errors.validation(
          'Uno o más productos no existen en el catálogo local',
          { missing_products: missingIds }
        )
      );
    }

    // Normalizar configuración de entrega y geolocalización
    const deliveryType = validatedData.tipo_entrega ?? 'domicilio';
    const geolocEnabled =
      deliveryType === 'recoger'
        ? false
        : validatedData.geolocalizacion_habilitada ?? false;
    const deliveryLat = geolocEnabled ? validatedData.latitud ?? null : null;
    const deliveryLng = geolocEnabled ? validatedData.longitud ?? null : null;

    // Iniciar transacción para garantizar atomicidad entre orden y productos
    await db.query('START TRANSACTION');

    try {
      // Calcular el total de la orden (acumulado de subtotales)
      const productDetails = validatedData.productos.map((producto) => {
        const catalogEntry = catalog.get(producto.producto_id)!;
        const price = Number(catalogEntry.precio);
        const discount = Number.isFinite(catalogEntry.descuento)
          ? catalogEntry.descuento
          : 0;
        const subtotal = Number(
          (price * producto.cantidad * (1 - discount / 100)).toFixed(2)
        );

        return {
          producto_id: producto.producto_id,
          cantidad: producto.cantidad,
          precio: price,
          descuento: discount,
          nombre: catalogEntry.nombre,
          marca: catalogEntry.marca,
          modelo: catalogEntry.modelo,
          imagen: catalogEntry.imagen,
          subtotal,
        };
      });

      // Ordenar productos de menor a mayor precio (requisito)
      productDetails.sort((a, b) => a.precio - b.precio);

      const merchandiseTotal = productDetails.reduce(
        (acc, item) => acc + item.subtotal,
        0
      );

      // Calcular costo de envío con preferencia por geolocalización válida
      const shippingInput: ShippingInput = {
        tipo_entrega: deliveryType,
        geolocalizacion_habilitada: geolocEnabled,
      };
      if (deliveryLat !== null && deliveryLng !== null) {
        shippingInput.latitud = deliveryLat;
        shippingInput.longitud = deliveryLng;
      }
      const costo_envio = calculateShippingCost(shippingInput);

      // Ajustar total final incluyendo envío
      const total = Number((merchandiseTotal + costo_envio).toFixed(2));

      // Derivar campos de pago
      const metodo_pago = validatedData.metodo_pago ?? 'tarjeta';
      const card_type = validatedData.tarjeta?.tipo ?? null;
      const card_brand = validatedData.tarjeta?.marca ?? null;
      const card_last4 = validatedData.tarjeta?.numero
        ? validatedData.tarjeta.numero.slice(-4)
        : null;
      const pse_reference = validatedData.pse_reference ?? null;
      const cash_on_delivery = validatedData.cash_on_delivery ? 1 : 0;

      // Crear la orden
      const [orderResult] = await db.query<ResultSetHeader>(
        `INSERT INTO orders (
           user_id, correo_usuario, direccion, nombre_completo,
           estado, total, fecha_pago,
           fecha_entrega_original,
           tipo_entrega, costo_envio, geolocalizacion_habilitada, latitud, longitud,
           metodo_pago, card_type, card_brand, card_last4, pse_reference, cash_on_delivery
         ) 
         VALUES (?, ?, ?, ?, 'en_proceso', ?, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          requestUserId,
          validatedData.correo_usuario,
          validatedData.direccion ?? 'Retiro en tienda',
          validatedData.nombre_completo,
          total,
          deliveryType,
          costo_envio,
          geolocEnabled ? 1 : 0,
          deliveryLat,
          deliveryLng,
          metodo_pago,
          card_type,
          card_brand,
          card_last4,
          pse_reference,
          cash_on_delivery,
        ]
      );

      const ordenId = orderResult.insertId;

      // Insertar productos de la orden
      for (const product of productDetails) {
        await db.query(
          `INSERT INTO order_products (orden_id, producto_id, product_uid, nombre, precio, descuento, marca, modelo, cantidad, imagen)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            ordenId,
            product.producto_id,
            null,
            product.nombre,
            product.precio,
            product.descuento,
            product.marca,
            product.modelo,
            product.cantidad,
            product.imagen,
          ]
        );
      }

      // Confirmar transacción: persistir cambios de orden y productos
      await db.query('COMMIT');

      // Obtener la orden creada con sus productos
      const [newOrder] = await db.query<OrderRow[]>(
        `SELECT ${ORDER_SELECT_FIELDS} FROM orders WHERE orden_id = ?`,
        [ordenId]
      );

      const [orderProducts] = await db.query<OrderProductRow[]>(
        `SELECT ${ORDER_PRODUCTS_SELECT_FIELDS} FROM order_products WHERE orden_id = ? ORDER BY precio ASC, descuento DESC`,
        [ordenId]
      );

      if (!newOrder[0]) {
        throw new Error('No se pudo crear la orden');
      }
      const response: OrderResponseDTO = {
        ...newOrder[0],
        productos: orderProducts,
      };

      res.status(201).json({
        message: 'Orden creada exitosamente',
        data: response,
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'Datos de entrada inválidos',
        details: error.errors,
      });
    }
    return next(error);
  }
}

/**
 * Lista órdenes con filtros y paginación.
 * Incluye productos por orden.
 * @param req Request con parámetros de consulta
 * @param res Response con órdenes paginadas
 */
export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // Validar parámetros de consulta
    const validatedQuery = ordersQuerySchema.parse(req.query);
    const {
      page,
      limit,
      user_id,
      estado,
      fecha_desde,
      fecha_hasta,
      sort,
      order,
    } = validatedQuery;

    // Normalizar el identificador del usuario autenticado como cadena
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Construir la consulta base (se filtra con condiciones dinámicas)
    // Consulta base: se complementará con condiciones dinámicas
    let baseQuery = `
      SELECT 
        ${ORDER_SELECT_FIELDS}
      FROM orders
      WHERE 1=1
    `;

    // Consulta de conteo para cálculo de páginas
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    // Acumulador de parámetros para ambas consultas
    const queryParams: any[] = [];

    // Si no es admin, solo puede ver sus propias órdenes
    if (!isAdmin) {
      baseQuery += ' AND user_id = ?';
      countQuery += ' AND user_id = ?';
      queryParams.push(authenticatedUserId);
    }

    // Aplicar filtros
    if (user_id && isAdmin) {
      baseQuery += ' AND user_id = ?';
      countQuery += ' AND user_id = ?';
      queryParams.push(String(user_id));
    }

    if (estado) {
      baseQuery += ' AND estado = ?';
      countQuery += ' AND estado = ?';
      queryParams.push(estado);
    }

    if (fecha_desde) {
      baseQuery += ' AND fecha_pago >= ?';
      countQuery += ' AND fecha_pago >= ?';
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      baseQuery += ' AND fecha_pago <= ?';
      countQuery += ' AND fecha_pago <= ?';
      queryParams.push(fecha_hasta);
    }

    // Aplicar ordenamiento
    if (sort === 'fecha_pago') {
      baseQuery += ` ORDER BY fecha_pago ${order}`;
    } else if (sort === 'total') {
      baseQuery += ` ORDER BY total ${order}`;
    } else if (sort === 'estado') {
      baseQuery += ` ORDER BY estado ${order}`;
    }

    // Obtener total de registros
    const [totalResult] = await db.query<RowDataPacket[]>(
      countQuery,
      queryParams
    );
    if (!totalResult[0]) {
      throw new Error('No se pudo obtener el total de órdenes');
    }
    const total = totalResult[0].total;

    // Calcular paginación
    const { pages, currentPage, offset, first, prev, next } = computePagination(
      total,
      limit,
      page
    );

    // Aplicar paginación
    baseQuery += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Ejecutar consulta
    const [orders] = await db.query<OrderRow[]>(baseQuery, queryParams);

    // Obtener productos para cada orden (N+1 consultas)
    const ordersWithProducts: OrderResponseDTO[] = []; // Acumulador de órdenes con sus productos
    for (const order of orders) {
      const [products] = await db.query<OrderProductRow[]>(
        `SELECT 
          ${ORDER_PRODUCTS_SELECT_FIELDS}
        FROM order_products 
        WHERE orden_id = ?
        ORDER BY precio ASC, descuento DESC`,
        [order.orden_id]
      );
      ordersWithProducts.push({
        ...order,
        productos: products,
      });
    }

    const response: OrdersPaginatedResponse = {
      total,
      pages,
      first,
      next,
      prev,
      data: ordersWithProducts,
    };

    res.status(200).json(response);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return next({
        status: 400,
        code: 'ORD_400_VALIDATION',
        message: 'Parámetros de consulta inválidos',
        details: error.errors,
      });
    }
    return next(error);
  }
}

/**
 * Devuelve una orden y sus productos por ID.
 * Requiere dueño o ADMINISTRADOR.
 * @param req Request con ID de la orden
 * @param res Response con la orden encontrada
 */
export async function getOrderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // Validar parámetro ID
    const { id } = orderIdSchema.parse(req.params);
    // Normalizar el identificador del usuario autenticado como cadena
    const authenticatedUserId = String(req.auth!.id);
    // Bandera de rol administrador para permisos de lectura
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Buscar la orden
    const [order] = await db.query<OrderRow[]>(
      `SELECT ${ORDER_SELECT_FIELDS} FROM orders WHERE orden_id = ?`,
      [id]
    );
    if (order.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    // Tras verificar la existencia, trabajamos con una referencia no nula
    const orderRow = order[0]!;
    // Normalizar el tipo del user_id de la orden para comparaciones
    const orderUserId = String(orderRow.user_id);

    // Verificar permisos (propietario o admin)
    if (!isAdmin && orderUserId !== authenticatedUserId) {
      return next(errors.forbidden('No tienes permisos para ver esta orden'));
    }

    // Obtener productos de la orden
    const [products] = await db.query<OrderProductRow[]>(
      `SELECT 
        ${ORDER_PRODUCTS_SELECT_FIELDS}
      FROM order_products 
      WHERE orden_id = ?
      ORDER BY descuento DESC, precio ASC`,
      [id]
    );

    const response: OrderResponseDTO = {
      ...orderRow,
      productos: products,
    };

    res.status(200).json({ data: response });
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

/**
 * Actualiza campos permitidos de una orden.
 * Valida permisos y retorna la orden actualizada.
 * @param req Request con ID y datos a actualizar
 * @param res Response con la orden actualizada
 */
export async function updateOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // Validar parámetro ID y datos
    const { id } = orderIdSchema.parse(req.params);
    const validatedData = updateOrderSchema.parse(req.body);
    // Normalizar el identificador del usuario autenticado como cadena
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe
    const [existingOrder] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado, tipo_entrega, geolocalizacion_habilitada, latitud, longitud FROM orders WHERE orden_id = ?',
      [id]
    );

    if (existingOrder.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }
    // Referencia no nula y normalización del tipo del user_id
    const existingOrderRow = existingOrder[0]!;
    const existingOrderUserId = String(existingOrderRow.user_id);
    const currentDeliveryType =
      (existingOrderRow.tipo_entrega as 'domicilio' | 'recoger' | undefined) ??
      'domicilio';
    const currentGeolocEnabled = Boolean(
      existingOrderRow.geolocalizacion_habilitada
    );
    const currentLat =
      existingOrderRow.latitud === null ||
      existingOrderRow.latitud === undefined
        ? null
        : Number(existingOrderRow.latitud);
    const currentLng =
      existingOrderRow.longitud === null ||
      existingOrderRow.longitud === undefined
        ? null
        : Number(existingOrderRow.longitud);

    // Verificar permisos
    const canUpdateStatus = isAdmin;
    const canUpdateAddress =
      isAdmin || existingOrderUserId === authenticatedUserId;

    if (validatedData.estado && !canUpdateStatus) {
      return next(
        errors.forbidden(
          'Solo los administradores pueden cambiar el estado de la orden'
        )
      );
    }

    if (validatedData.direccion && !canUpdateAddress) {
      return next(
        errors.forbidden('No tienes permisos para actualizar esta orden')
      );
    }

    // Construir consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (validatedData.estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(validatedData.estado);
    }

    if (validatedData.direccion !== undefined) {
      updateFields.push('direccion = ?');
      updateValues.push(validatedData.direccion);
    }

    const toMySql = (iso?: string) =>
      iso
        ? new Date(iso).toISOString().slice(0, 19).replace('T', ' ')
        : undefined;

    if (validatedData.fecha_entrega_original !== undefined) {
      const fecha = toMySql(validatedData.fecha_entrega_original)!;
      updateFields.push('fecha_entrega_original = ?');
      updateValues.push(fecha);
    }

    if (validatedData.fecha_entrega_retrasada !== undefined) {
      const fecha = toMySql(validatedData.fecha_entrega_retrasada)!;
      updateFields.push('fecha_entrega_retrasada = ?');
      updateValues.push(fecha);
      // Si hay retraso y no es cancelada/entregada, marcar estado retrasado
      if (
        existingOrderRow.estado !== 'cancelado' &&
        existingOrderRow.estado !== 'entregado' &&
        !validatedData.estado
      ) {
        updateFields.push("estado = 'retrasado'");
      }
    }

    // Actualizar tipo de entrega y recalcular costo si cambia algo relevante
    let recalcShipping = false;
    let nextDeliveryType = validatedData.tipo_entrega ?? currentDeliveryType;
    let nextGeolocEnabled =
      nextDeliveryType === 'recoger'
        ? false
        : validatedData.geolocalizacion_habilitada ?? currentGeolocEnabled;
    let nextLat: number | null =
      validatedData.latitud !== undefined ? validatedData.latitud : currentLat;
    let nextLng: number | null =
      validatedData.longitud !== undefined
        ? validatedData.longitud
        : currentLng;

    if (validatedData.tipo_entrega !== undefined) {
      updateFields.push('tipo_entrega = ?');
      updateValues.push(validatedData.tipo_entrega);
      recalcShipping = true;

      if (validatedData.tipo_entrega === 'recoger') {
        // Para retiro en tienda, deshabilitar geolocalización y limpiar coordenadas
        nextGeolocEnabled = false;
        nextLat = null;
        nextLng = null;
        updateFields.push('geolocalizacion_habilitada = 0');
        updateFields.push('latitud = NULL');
        updateFields.push('longitud = NULL');
      }
    }

    if (
      validatedData.geolocalizacion_habilitada !== undefined &&
      nextDeliveryType !== 'recoger'
    ) {
      nextGeolocEnabled = validatedData.geolocalizacion_habilitada;
      updateFields.push('geolocalizacion_habilitada = ?');
      updateValues.push(validatedData.geolocalizacion_habilitada ? 1 : 0);
      recalcShipping = true;

      if (!validatedData.geolocalizacion_habilitada) {
        nextLat = null;
        nextLng = null;
        updateFields.push('latitud = NULL');
        updateFields.push('longitud = NULL');
      }
    }

    if (
      validatedData.latitud !== undefined &&
      nextDeliveryType !== 'recoger' &&
      nextGeolocEnabled
    ) {
      nextLat = validatedData.latitud;
      updateFields.push('latitud = ?');
      updateValues.push(validatedData.latitud);
      recalcShipping = true;
    }
    if (
      validatedData.longitud !== undefined &&
      nextDeliveryType !== 'recoger' &&
      nextGeolocEnabled
    ) {
      nextLng = validatedData.longitud;
      updateFields.push('longitud = ?');
      updateValues.push(validatedData.longitud);
      recalcShipping = true;
    }

    // Método de pago (campos opcionales)
    if (validatedData.metodo_pago !== undefined) {
      updateFields.push('metodo_pago = ?');
      updateValues.push(validatedData.metodo_pago);
    }
    if (validatedData.tarjeta?.tipo !== undefined) {
      updateFields.push('card_type = ?');
      updateValues.push(validatedData.tarjeta.tipo);
    }
    if (validatedData.tarjeta?.marca !== undefined) {
      updateFields.push('card_brand = ?');
      updateValues.push(validatedData.tarjeta.marca);
    }
    if (validatedData.tarjeta?.numero !== undefined) {
      updateFields.push('card_last4 = ?');
      updateValues.push(validatedData.tarjeta.numero.slice(-4));
    }
    if (validatedData.pse_reference !== undefined) {
      updateFields.push('pse_reference = ?');
      updateValues.push(validatedData.pse_reference);
    }
    if (validatedData.cash_on_delivery !== undefined) {
      updateFields.push('cash_on_delivery = ?');
      updateValues.push(validatedData.cash_on_delivery ? 1 : 0);
    }

    // Recalcular costo de envío si corresponde
    if (recalcShipping) {
      const shippingUpdateInput: ShippingInput = {
        tipo_entrega: nextDeliveryType,
        geolocalizacion_habilitada: nextGeolocEnabled,
      };
      if (nextGeolocEnabled && nextLat !== null && nextLng !== null) {
        shippingUpdateInput.latitud = nextLat;
        shippingUpdateInput.longitud = nextLng;
      }
      const costo_envio = calculateShippingCost(shippingUpdateInput);
      updateFields.push('costo_envio = ?');
      updateValues.push(costo_envio);
    }

    if (updateFields.length === 0) {
      return next(errors.validation('No hay campos para actualizar'));
    }

    updateValues.push(id);

    // Actualizar la orden
    await db.query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE orden_id = ?`,
      updateValues
    );

    // Obtener la orden actualizada
    const [updatedOrder] = await db.query<OrderRow[]>(
      `SELECT ${ORDER_SELECT_FIELDS} FROM orders WHERE orden_id = ?`,
      [id]
    );

    if (!updatedOrder[0]) {
      throw new Error('No se pudo actualizar la orden');
    }
    const [products] = await db.query<OrderProductRow[]>(
      `SELECT 
        ${ORDER_PRODUCTS_SELECT_FIELDS}
      FROM order_products 
      WHERE orden_id = ?
      ORDER BY descuento DESC, precio ASC`,
      [id]
    );

    const response: OrderResponseDTO = {
      orden_id: updatedOrder[0].orden_id!,
      user_id: updatedOrder[0].user_id!,
      correo_usuario: updatedOrder[0].correo_usuario!,
      direccion: updatedOrder[0].direccion!,
      nombre_completo: updatedOrder[0].nombre_completo!,
      estado: updatedOrder[0].estado!,
      total: updatedOrder[0].total!,
      ...(updatedOrder[0].fecha_pago && {
        fecha_pago: updatedOrder[0].fecha_pago,
      }),
      ...(updatedOrder[0].fecha_entrega && {
        fecha_entrega: updatedOrder[0].fecha_entrega,
      }),
      productos: products,
    };

    res.status(200).json({
      message: 'Orden actualizada exitosamente',
      data: response,
    });
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
 * Elimina una orden.
 * Solo ADMINISTRADOR.
 * @param req Request con ID de la orden
 * @param res Response de confirmación
 */
export async function deleteOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    // Validar parámetro ID
    const { id } = orderIdSchema.parse(req.params);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    // Verificar que la orden existe
    const [existingOrder] = await db.query<RowDataPacket[]>(
      'SELECT user_id, estado FROM orders WHERE orden_id = ?',
      [id]
    );

    if (existingOrder.length === 0) {
      return next(errors.notFound('Orden no encontrada'));
    }

    // Solo admins pueden eliminar órdenes
    if (!isAdmin) {
      return next(
        errors.forbidden('Solo los administradores pueden eliminar órdenes')
      );
    }

    // Eliminar la orden (los productos se eliminan automáticamente por CASCADE)
    await db.query('DELETE FROM orders WHERE orden_id = ?', [id]);

    res.status(200).json({ message: 'Orden eliminada exitosamente' });
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

/**
 * Estadísticas de órdenes y productos más comprados.
 * Restringe por usuario si no es ADMINISTRADOR.
 * @param req Request
 * @param res Response con estadísticas
 */
export async function getOrderStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const authenticatedUserId = String(req.auth!.id);
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    let userCondition = '';
    const queryParams: any[] = [];

    // Si no es admin, solo puede ver sus propias estadísticas
    if (!isAdmin) {
      userCondition = 'WHERE user_id = ?';
      queryParams.push(authenticatedUserId);
    }

    // Obtener estadísticas generales
    const [stats] = await db.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_ordenes,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'retrasado' THEN 1 ELSE 0 END) as retrasadas,
        SUM(CASE WHEN estado = 'entregado' THEN 1 ELSE 0 END) as entregadas,
        SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as canceladas,
        COALESCE(SUM(total), 0) as total_gastado,
        COALESCE(AVG(total), 0) as promedio_orden
      FROM orders ${userCondition}`,
      queryParams
    );

    // Obtener productos más comprados
    const [topProducts] = await db.query<RowDataPacket[]>(
      `SELECT 
        op.nombre,
        op.marca,
        op.modelo,
        SUM(op.cantidad) as total_comprado,
        COUNT(DISTINCT op.orden_id) as veces_ordenado
      FROM order_products op
      JOIN orders o ON op.orden_id = o.orden_id
      ${userCondition ? 'WHERE o.user_id = ?' : ''}
      GROUP BY op.producto_id, op.nombre, op.marca, op.modelo
      ORDER BY total_comprado DESC
      LIMIT 5`,
      userCondition ? [authenticatedUserId] : []
    );

    res.status(200).json({
      data: {
        estadisticas: stats[0],
        productos_favoritos: topProducts,
      },
    });
  } catch (error: any) {
    return next(error);
  }
}
