import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ZodError } from 'zod';

// Importaciones de validadores
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
  uuidSchema
} from '../validators/order.validators';

// Importaciones de tipos
// Importaciones de tipos
import {
  OrderHistoryResponse,
  OrderDetailsResponse,
  OrderStatus,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  JWTPayload
} from '../types/order.types';

// Importaciones de modelos
import { OrderModel } from '../models/order.model';

/**
 * Controlador para manejo de órdenes
 * Contiene todos los endpoints relacionados con la gestión de órdenes
 */

export class OrderController {

  /**
   * Obtener historial de órdenes del usuario autenticado
   * GET /orders
   */
  static async getOrderHistory(req: Request, res: Response) {
    try {
      const validatedQuery = orderQuerySchema.parse(req.query);
      const userId = req.user!.userId;

      const { orders, total } = await OrderModel.getOrdersByUser(userId, validatedQuery);
      const statistics = await OrderModel.getUserOrderStatistics(userId);

      const { page = 1, limit = 10 } = validatedQuery;
      const totalPages = Math.ceil(total / limit);

      const response: OrderHistoryResponse = {
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          orderDate: order.orderDate,
          estimatedDelivery: order.estimatedDelivery,
          actualDelivery: order.actualDelivery,
          trackingNumber: order.trackingNumber,
          itemCount: order.items.length,
          items: order.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            productImage: item.productImage
          }))
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        },
        statistics
      };

      res.status(200).json(response);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parámetros inválidos',
          details: error.issues
        });
      }

      console.error('Error obteniendo historial de órdenes:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener detalles de una orden específica
   * GET /orders/:id
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = uuidSchema.parse({ id: req.params.id });
      const userId = req.user!.userId;

      const order = await OrderModel.getOrderById(id, userId);

      if (!order) {
        return res.status(404).json({
          error: 'Orden no encontrada',
          message: 'La orden solicitada no existe o no tienes permisos para verla'
        });
      }

      const response: OrderDetailsResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
        updatedAt: order.updatedAt,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        itemCount: order.items.length,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productImage: item.productImage
        }))
      };

      res.status(200).json(response);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'ID inválido',
          details: error.issues
        });
      }

      console.error('Error obteniendo orden por ID:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear una nueva orden
   * POST /orders
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const userId = req.user!.userId;

      const order = await OrderModel.createOrder(userId, validatedData);

      const response: OrderDetailsResponse = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
        updatedAt: order.updatedAt,
        estimatedDelivery: order.estimatedDelivery,
        actualDelivery: order.actualDelivery,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        itemCount: order.items.length,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productImage: item.productImage
        }))
      };

      res.status(201).json(response);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.issues
        });
      }

      console.error('Error creando orden:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado de una orden (solo administradores)
   * PUT /orders/:id/status
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = uuidSchema.parse({ id: req.params.id });
      const validatedData = updateOrderStatusSchema.parse(req.body);
      const updatedBy = req.user!.userId;

      // Verificar que la orden existe
      const existingOrder = await OrderModel.getOrderById(id);
      if (!existingOrder) {
        return res.status(404).json({
          error: 'Orden no encontrada',
          message: 'La orden solicitada no existe'
        });
      }

      const success = await OrderModel.updateOrderStatus(id, validatedData, updatedBy);

      if (!success) {
        return res.status(500).json({
          error: 'Error actualizando orden',
          message: 'No se pudo actualizar el estado de la orden'
        });
      }

      // Obtener la orden actualizada
      const updatedOrder = await OrderModel.getOrderById(id);

      res.status(200).json({
        id: updatedOrder!.id,
        orderNumber: updatedOrder!.orderNumber,
        status: updatedOrder!.status,
        trackingNumber: updatedOrder!.trackingNumber,
        updatedAt: updatedOrder!.updatedAt,
        message: 'Estado de la orden actualizado exitosamente'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.issues
        });
      }

      console.error('Error actualizando estado de orden:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de órdenes del usuario
   * GET /orders/statistics
   */
  static async getUserStatistics(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const statistics = await OrderModel.getUserOrderStatistics(userId);

      res.status(200).json(statistics);

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener órdenes por estado (para administradores)
   * GET /orders/admin/by-status/:status
   */
  static async getOrdersByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const validatedQuery = orderQuerySchema.parse(req.query);

      // Validar que el estado es válido
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        return res.status(400).json({
          error: 'Estado inválido',
          message: 'El estado proporcionado no es válido'
        });
      }

      const queryParams = { ...validatedQuery, status: status as OrderStatus };
      
      // Para administradores, obtener órdenes de todos los usuarios
      const { orders, total } = await OrderModel.getOrdersByUser('', queryParams);

      const { page = 1, limit = 10 } = validatedQuery;
      const totalPages = Math.ceil(total / limit);

      const response = {
        orders: orders.map(order => ({
          id: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          orderDate: order.orderDate,
          estimatedDelivery: order.estimatedDelivery,
          actualDelivery: order.actualDelivery,
          trackingNumber: order.trackingNumber,
          itemCount: order.items.length
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };

      res.status(200).json(response);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parámetros inválidos',
          details: error.issues
        });
      }

      console.error('Error obteniendo órdenes por estado:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}