import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/reviews
 * @desc Crear una nueva reseña
 * @access Privado (requiere autenticación)
 */
router.post('/', authenticateToken, ReviewController.createReview);

/**
 * @route GET /api/reviews
 * @desc Obtener todas las reseñas con filtros y ordenamiento
 * @access Público
 * @query productId - Filtrar por ID del producto
 * @query userId - Filtrar por ID del usuario
 * @query sortBy - Ordenar por 'date' o 'rating' (default: 'date')
 * @query sortOrder - 'asc' o 'desc' (default: 'desc')
 * @query limit - Número de resultados por página (default: 10, max: 100)
 * @query offset - Número de resultados a omitir (default: 0)
 */
router.get('/', ReviewController.getReviews);

/**
 * @route GET /api/reviews/:id
 * @desc Obtener una reseña específica por ID
 * @access Público
 */
router.get('/:id', ReviewController.getReviewById);

/**
 * @route GET /api/reviews/product/:productId
 * @desc Obtener todas las reseñas de un producto específico
 * @access Público
 */
router.get('/product/:productId', ReviewController.getReviewsByProduct);

/**
 * @route GET /api/reviews/user/:userId
 * @desc Obtener todas las reseñas de un usuario específico
 * @access Privado (solo el propietario o admin)
 */
router.get('/user/:userId', authenticateToken, ReviewController.getReviewsByUser);

/**
 * @route PUT /api/reviews/:id
 * @desc Actualizar una reseña existente
 * @access Privado (solo el propietario o admin)
 */
router.put('/:id', authenticateToken, ReviewController.updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @desc Eliminar una reseña
 * @access Privado (solo el propietario o admin)
 */
router.delete('/:id', authenticateToken, ReviewController.deleteReview);

/**
 * @route GET /api/reviews/statistics/:productId
 * @desc Obtener estadísticas detalladas de un producto
 * @access Público
 */
router.get('/statistics/:productId', ReviewController.getProductStatistics);

export default router;