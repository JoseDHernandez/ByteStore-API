/** Express router for HTTP routing */
import { Router } from 'express';
/** Order business logic handlers */
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from '../controllers/orders.controller.js';
/** Authentication and authorization middleware */
import { authMiddleware, isAdmin } from '../middleware/auth.js';

/** Router instance for order-related endpoints */
const router = Router();

/** Apply authentication to all order routes - requires valid JWT */
router.use(authMiddleware);

/**
 * GET /auth/validate
 * Quick token validation endpoint - returns decoded user info
 * Useful for mobile/web clients to verify token validity
 */
router.get('/auth/validate', (req, res) => {
  return res.status(200).json({
    message: 'Token válido',
    user: req.auth,
  });
});

/** GET / - Retrieve paginated orders with optional filters (user-scoped) */
router.get('/', getOrders);

/** POST / - Create a new order for authenticated user */
router.post('/', createOrder);

/** GET /stats - Get order statistics for authenticated user */
router.get('/stats', getOrderStats);

/** GET /:id - Retrieve single order by ID (ownership verified in controller) */
router.get('/:id', getOrderById);

/** PUT /:id - Update order (status admin-only, address owner/admin) */
router.put('/:id', updateOrder);

/** DELETE /:id - Delete order (admin-only) */
router.delete('/:id', isAdmin, deleteOrder);

export default router;
