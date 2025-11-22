/** Express router for HTTP endpoint routing */
import { Router } from 'express';
/** Review business logic controllers */
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from '../controllers/reviews.controller.ts';
/** Authentication and authorization middleware */
import { authMiddleware, canAccessResource } from '../middleware/auth.ts';

/** Router instance for review-related endpoints */
const router = Router();

/**
 * GET /auth/validate
 * Token validation endpoint - returns decoded user info if valid
 * Requires authentication
 */
router.get('/auth/validate', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: 'Token válido',
    user: req.auth,
  });
});

/** GET / - Retrieve paginated reviews with optional filters (public access) */
router.get('/', getReviews);

/** POST / - Create a new product review (authenticated users only) */
router.post('/', authMiddleware, createReview);

/** GET /:id - Get single review by ID (public access) */
router.get('/:id', getReviewById);

/** PUT /:id - Update review (owner or admin only) */
router.put('/:id', authMiddleware, canAccessResource, updateReview);

/** DELETE /:id - Delete review (owner or admin only) */
router.delete('/:id', authMiddleware, canAccessResource, deleteReview);

export default router;
