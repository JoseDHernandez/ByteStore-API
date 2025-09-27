import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken, isAdmin, isOwnerOrAdmin } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas del router
router.use(authenticateToken);

/**
 * @route GET /api/orders/history
 * @desc Obtener historial de órdenes del usuario autenticado
 * @access Privado (requiere autenticación)
 * @query page - Número de página (default: 1)
 * @query limit - Número de resultados por página (default: 10, max: 100)
 * @query status - Filtrar por estado de orden
 * @query startDate - Fecha de inicio para filtrar (ISO string)
 * @query endDate - Fecha de fin para filtrar (ISO string)
 * @query sortBy - Ordenar por 'order_date', 'totalAmount', 'status' (default: 'order_date')
 * @query sortOrder - 'asc' o 'desc' (default: 'desc')
 */
router.get('/history', OrderController.getOrderHistory);

/**
 * @route GET /api/orders/statistics
 * @desc Obtener estadísticas de órdenes del usuario autenticado
 * @access Privado (requiere autenticación)
 */
router.get('/statistics', OrderController.getUserStatistics);

/**
 * @route GET /api/orders/status/:status
 * @desc Obtener órdenes por estado (solo administradores)
 * @access Privado (solo administradores)
 * @query page - Número de página (default: 1)
 * @query limit - Número de resultados por página (default: 10, max: 100)
 */
router.get('/status/:status', isAdmin, OrderController.getOrdersByStatus);

/**
 * @route GET /api/orders/:id
 * @desc Obtener una orden específica por ID
 * @access Privado (propietario o administrador)
 */
router.get('/:id', isOwnerOrAdmin, OrderController.getOrderById);

/**
 * @route POST /api/orders
 * @desc Crear una nueva orden
 * @access Privado (requiere autenticación)
 * @body items - Array de productos con cantidad
 * @body shippingAddress - Dirección de envío
 * @body billingAddress - Dirección de facturación
 * @body paymentMethod - Método de pago
 * @body notes - Notas adicionales (opcional)
 */
router.post('/', OrderController.createOrder);

/**
 * @route PUT /api/orders/:id/status
 * @desc Actualizar el estado de una orden
 * @access Privado (solo administradores)
 * @body status - Nuevo estado de la orden
 * @body trackingNumber - Número de seguimiento (opcional)
 * @body notes - Notas adicionales (opcional)
 */
router.put('/:id/status', isAdmin, OrderController.updateOrderStatus);

export default router;