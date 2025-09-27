import { Request, Response } from 'express';
import { ReviewModel } from '../models/review.model';
import { 
  createReviewSchema, 
  updateReviewSchema, 
  reviewQuerySchema, 
  uuidSchema 
} from '../validators/review.validators';
import { ZodError } from 'zod';

export class ReviewController {

  /**
   * Crear una nueva reseña
   * POST /api/reviews
   */
  static async createReview(req: Request, res: Response) {
    try {
      const validatedData = createReviewSchema.parse(req.body);
      const userId = req.user!.id;

      // Verificar si el usuario ya tiene una reseña para este producto
      const existingReview = await ReviewModel.checkUserReviewExists(userId, validatedData.productId);
      if (existingReview) {
        return res.status(409).json({
          error: 'Conflicto',
          message: 'Ya tienes una reseña para este producto'
        });
      }

      const review = await ReviewModel.create(userId, validatedData);

      res.status(201).json(review);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.issues
        });
      }

      console.error('Error creando reseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todas las reseñas con filtros y ordenamiento
   * GET /api/reviews
   */
  static async getReviews(req: Request, res: Response) {
    try {
      const validatedQuery = reviewQuerySchema.parse(req.query);
      const reviews = await ReviewModel.findAll(validatedQuery);

      res.status(200).json(reviews);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: error.issues
        });
      }

      console.error('Error obteniendo reseñas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener una reseña por ID
   * GET /api/reviews/:id
   */
  static async getReviewById(req: Request, res: Response) {
    try {
      const reviewId = uuidSchema.parse(req.params.id);
      const review = await ReviewModel.findById(reviewId);

      if (!review) {
        return res.status(404).json({
          error: 'Reseña no encontrada'
        });
      }

      res.status(200).json(review);

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'ID inválido',
          details: error.issues
        });
      }

      console.error('Error obteniendo reseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reseñas por producto
   * GET /api/reviews/product/:productId
   */
  static async getReviewsByProduct(req: Request, res: Response) {
    try {
      const productId = uuidSchema.parse(req.params.productId);
      const validatedQuery = reviewQuerySchema.parse(req.query);
      
      const reviews = await ReviewModel.findByProductId(productId, validatedQuery);
      const averageRating = await ReviewModel.getAverageRating(productId);
      const totalReviews = await ReviewModel.getReviewCount(productId);

      res.status(200).json({
        data: reviews,
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews
        },
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset
        }
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parámetros inválidos',
          details: error.issues
        });
      }

      console.error('Error obteniendo reseñas del producto:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reseñas por usuario
   * GET /api/reviews/user/:userId
   */
  static async getReviewsByUser(req: Request, res: Response) {
    try {
      const userId = uuidSchema.parse(req.params.userId);
      const validatedQuery = reviewQuerySchema.parse(req.query);
      
      // Verificar que el usuario puede acceder a estas reseñas
      if (req.user!.role !== 'admin' && req.user!.id !== userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes ver tus propias reseñas'
        });
      }

      const reviews = await ReviewModel.findByUserId(userId, validatedQuery);

      res.status(200).json({
        message: 'Reseñas del usuario obtenidas exitosamente',
        data: reviews,
        pagination: {
          limit: validatedQuery.limit,
          offset: validatedQuery.offset
        }
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Parámetros inválidos',
          details: error.issues
        });
      }

      console.error('Error obteniendo reseñas del usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar una reseña
   * PUT /api/reviews/:id
   */
  static async updateReview(req: Request, res: Response) {
    try {
      const reviewId = uuidSchema.parse(req.params.id);
      const validatedData = updateReviewSchema.parse(req.body);

      // Verificar que la reseña existe
      const existingReview = await ReviewModel.findById(reviewId);
      if (!existingReview) {
        return res.status(404).json({
          error: 'Reseña no encontrada'
        });
      }

      // Verificar permisos: solo el propietario o admin pueden actualizar
      if (req.user!.role !== 'admin' && req.user!.id !== existingReview.userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes actualizar tus propias reseñas'
        });
      }

      const updatedReview = await ReviewModel.update(reviewId, validatedData);

      res.status(200).json({
        message: 'Reseña actualizada exitosamente',
        data: updatedReview
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.issues
        });
      }

      console.error('Error actualizando reseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar una reseña
   * DELETE /api/reviews/:id
   */
  static async deleteReview(req: Request, res: Response) {
    try {
      const reviewId = uuidSchema.parse(req.params.id);

      // Verificar que la reseña existe
      const existingReview = await ReviewModel.findById(reviewId);
      if (!existingReview) {
        return res.status(404).json({
          error: 'Reseña no encontrada'
        });
      }

      // Verificar permisos: solo el propietario o admin pueden eliminar
      if (req.user!.role !== 'admin' && req.user!.id !== existingReview.userId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes eliminar tus propias reseñas'
        });
      }

      const deleted = await ReviewModel.delete(reviewId);
      
      if (!deleted) {
        return res.status(500).json({
          error: 'Error eliminando la reseña'
        });
      }

      res.status(200).json({
        message: 'Reseña eliminada exitosamente'
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'ID inválido',
          details: error.issues
        });
      }

      console.error('Error eliminando reseña:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de reseñas por producto
   * GET /api/reviews/statistics/:productId
   */
  static async getProductStatistics(req: Request, res: Response) {
    try {
      const productId = uuidSchema.parse(req.params.productId);
      
      const statistics = await ReviewModel.getProductStatistics(productId);

      res.status(200).json({
        message: 'Estadísticas obtenidas exitosamente',
        data: statistics
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'ID de producto inválido',
          details: error.issues
        });
      }

      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}