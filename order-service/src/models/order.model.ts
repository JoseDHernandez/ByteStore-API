import { pool } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { 
  Order, 
  OrderItem, 
  CreateOrderRequest, 
  UpdateOrderStatusRequest, 
  OrderQueryParams,
  OrderStatus,
  PaymentStatus 
} from '../types/order.types';

export class OrderModel {
  
  // Obtener órdenes por usuario con paginación y filtros
  static async getOrdersByUser(
    userId: string, 
    params: OrderQueryParams = {}
  ): Promise<{ orders: Order[], total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sortBy = 'order_date',
      sortOrder = 'desc'
    } = params;

    // Asegurar que page y limit sean números
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
    
    // Validar que los valores sean números válidos
    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Page debe ser un número válido mayor a 0');
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new Error('Limit debe ser un número válido mayor a 0');
    }
    
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE o.user_id = ?';
    const queryParams: any[] = [userId];
    
    // Log para debugging
    console.log('Parámetros de paginación:', { 
      page, 
      limit, 
      pageNum, 
      limitNum, 
      offset,
      userId,
      queryParamsLength: queryParams.length 
    });
    if (status) {
      whereClause += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    if (startDate) {
      whereClause += ' AND o.order_date >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND o.order_date <= ?';
      queryParams.push(endDate);
    }

    const orderClause = `ORDER BY o.${sortBy} ${sortOrder.toUpperCase()}`;
    
    // Query para obtener órdenes
    const ordersQuery = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ${orderClause}
      LIMIT ` + limitNum + ` OFFSET ` + offset + `
    `;
    
    // Query para contar total
    const countQuery = `
      SELECT COUNT(DISTINCT o.id) as total
      FROM orders o
      ${whereClause}
    `;

    try {
      const [ordersResult] = await pool.execute<RowDataPacket[]>(
        ordersQuery, 
        queryParams
      );
      
      const [countResult] = await pool.execute<RowDataPacket[]>(
        countQuery, 
        queryParams
      );

      const orders = await Promise.all(
        ordersResult.map(async (orderRow) => {
          const items = await this.getOrderItems(orderRow.id);
          return this.mapRowToOrder(orderRow, items);
        })
      );

      return {
        orders,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('Error obteniendo órdenes por usuario:', error);
      throw new Error('Error al obtener el historial de órdenes');
    }
  }

  // Obtener una orden específica por ID
  static async getOrderById(orderId: string, userId?: string): Promise<Order | null> {
    let query = `
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `;
    
    const queryParams = [orderId];
    
    if (userId) {
      query += ' AND o.user_id = ?';
      queryParams.push(userId);
    }
    
    query += ' GROUP BY o.id';

    try {
      const [result] = await pool.execute<RowDataPacket[]>(query, queryParams);
      
      if (result.length === 0) {
        return null;
      }

      const items = await this.getOrderItems(orderId);
      return this.mapRowToOrder(result[0], items);
    } catch (error) {
      console.error('Error obteniendo orden por ID:', error);
      throw new Error('Error al obtener los detalles de la orden');
    }
  }

  // Crear una nueva orden
  static async createOrder(userId: string, orderData: CreateOrderRequest): Promise<Order> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const orderId = uuidv4();
      const orderNumber = await this.generateOrderNumber();
      
      // Calcular totales (aquí deberías obtener precios reales de productos)
      let subtotal = 0;
      const orderItems: any[] = [];
      
      for (const item of orderData.items) {
        // En un caso real, obtendrías el precio del producto desde product-service
        const unitPrice = 999.99; // Precio simulado
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;
        
        orderItems.push({
          id: uuidv4(),
          orderId,
          productId: item.productId,
          productName: `Producto ${item.productId}`, // Obtener nombre real del producto
          productSku: `SKU-${item.productId}`,
          quantity: item.quantity,
          unitPrice,
          totalPrice
        });
      }

      const tax = subtotal * 0.19; // 19% IVA
      const shippingCost = subtotal > 500 ? 0 : 50; // Envío gratis por compras > $500
      const totalAmount = subtotal + tax + shippingCost;

      // Insertar orden
      const insertOrderQuery = `
        INSERT INTO orders (
          id, user_id, order_number, status, total_amount, subtotal, tax, shipping_cost,
          payment_method, payment_status, order_date,
          shipping_first_name, shipping_last_name, shipping_company, shipping_address1, 
          shipping_address2, shipping_city, shipping_state, shipping_postal_code, 
          shipping_country, shipping_phone,
          billing_first_name, billing_last_name, billing_company, billing_address1,
          billing_address2, billing_city, billing_state, billing_postal_code,
          billing_country, billing_phone, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.execute(insertOrderQuery, [
        orderId, userId, orderNumber, OrderStatus.PENDING, totalAmount, subtotal, tax, shippingCost,
        orderData.paymentMethod, PaymentStatus.PENDING,
        orderData.shippingAddress.firstName, orderData.shippingAddress.lastName,
        orderData.shippingAddress.company, orderData.shippingAddress.address1,
        orderData.shippingAddress.address2, orderData.shippingAddress.city,
        orderData.shippingAddress.state, orderData.shippingAddress.postalCode,
        orderData.shippingAddress.country, orderData.shippingAddress.phone,
        orderData.billingAddress.firstName, orderData.billingAddress.lastName,
        orderData.billingAddress.company, orderData.billingAddress.address1,
        orderData.billingAddress.address2, orderData.billingAddress.city,
        orderData.billingAddress.state, orderData.billingAddress.postalCode,
        orderData.billingAddress.country, orderData.billingAddress.phone,
        orderData.notes
      ]);

      // Insertar items de la orden
      for (const item of orderItems) {
        const insertItemQuery = `
          INSERT INTO order_items (
            id, order_id, product_id, product_name, product_sku, 
            quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(insertItemQuery, [
          item.id, item.orderId, item.productId, item.productName,
          item.productSku, item.quantity, item.unitPrice, item.totalPrice
        ]);
      }

      await connection.commit();
      
      // Retornar la orden creada
      const createdOrder = await this.getOrderById(orderId);
      return createdOrder!;
      
    } catch (error) {
      await connection.rollback();
      console.error('Error creando orden:', error);
      throw new Error('Error al crear la orden');
    } finally {
      connection.release();
    }
  }

  // Actualizar estado de una orden
  static async updateOrderStatus(
    orderId: string, 
    statusData: UpdateOrderStatusRequest,
    updatedBy?: string
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener estado actual
      const [currentOrder] = await connection.execute<RowDataPacket[]>(
        'SELECT status FROM orders WHERE id = ?',
        [orderId]
      );

      if (currentOrder.length === 0) {
        throw new Error('Orden no encontrada');
      }

      const previousStatus = currentOrder[0].status;

      // Actualizar orden
      const updateQuery = `
        UPDATE orders 
        SET status = ?, tracking_number = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await connection.execute(updateQuery, [
        statusData.status,
        statusData.trackingNumber,
        statusData.notes,
        orderId
      ]);

      // Registrar cambio en historial
      const historyQuery = `
        INSERT INTO order_status_history (
          id, order_id, previous_status, new_status, changed_by, change_reason
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await connection.execute(historyQuery, [
        uuidv4(),
        orderId,
        previousStatus,
        statusData.status,
        updatedBy,
        statusData.notes
      ]);

      await connection.commit();
      return true;
      
    } catch (error) {
      await connection.rollback();
      console.error('Error actualizando estado de orden:', error);
      throw new Error('Error al actualizar el estado de la orden');
    } finally {
      connection.release();
    }
  }

  // Obtener estadísticas de órdenes por usuario
  static async getUserOrderStatistics(userId: string): Promise<any> {
    try {
      const [result] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_spent,
          AVG(total_amount) as average_order_value,
          status,
          COUNT(*) as status_count
        FROM orders 
        WHERE user_id = ?
        GROUP BY status
      `, [userId]);

      const [totalResult] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_spent,
          COALESCE(AVG(total_amount), 0) as average_order_value
        FROM orders 
        WHERE user_id = ?
      `, [userId]);

      const statusBreakdown: Record<string, number> = {};
      result.forEach(row => {
        statusBreakdown[row.status] = row.status_count;
      });

      return {
        totalOrders: totalResult[0].total_orders,
        totalSpent: parseFloat(totalResult[0].total_spent),
        averageOrderValue: parseFloat(totalResult[0].average_order_value),
        statusBreakdown
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas de órdenes');
    }
  }

  // Métodos auxiliares
  private static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const [result] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    return result.map(row => ({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      productName: row.product_name,
      productSku: row.product_sku,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      totalPrice: parseFloat(row.total_price),
      productImage: row.product_image,
      specifications: row.specifications ? JSON.parse(row.specifications) : undefined
    }));
  }

  private static mapRowToOrder(row: any, items: OrderItem[]): Order {
    return {
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      status: row.status,
      totalAmount: parseFloat(row.total_amount),
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      shippingCost: parseFloat(row.shipping_cost),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      orderDate: row.order_date,
      updatedAt: row.updated_at,
      estimatedDelivery: row.estimated_delivery,
      actualDelivery: row.actual_delivery,
      trackingNumber: row.tracking_number,
      notes: row.notes,
      shippingAddress: {
        firstName: row.shipping_first_name,
        lastName: row.shipping_last_name,
        company: row.shipping_company,
        address1: row.shipping_address1,
        address2: row.shipping_address2,
        city: row.shipping_city,
        state: row.shipping_state,
        postalCode: row.shipping_postal_code,
        country: row.shipping_country,
        phone: row.shipping_phone
      },
      billingAddress: {
        firstName: row.billing_first_name,
        lastName: row.billing_last_name,
        company: row.billing_company,
        address1: row.billing_address1,
        address2: row.billing_address2,
        city: row.billing_city,
        state: row.billing_state,
        postalCode: row.billing_postal_code,
        country: row.billing_country,
        phone: row.billing_phone
      },
      items
    };
  }

  private static async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const [result] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM orders WHERE YEAR(order_date) = ?',
      [year]
    );
    
    const orderCount = result[0].count + 1;
    return `ORD-${year}-${orderCount.toString().padStart(6, '0')}`;
  }
}