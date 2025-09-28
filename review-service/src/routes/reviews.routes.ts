import { Router } from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.ts";
import { authMiddleware, canAccessResource } from "../middleware/auth.ts";

const router = Router();

// GET / - Obtener reviews paginadas (acceso público)
router.get('/', getReviews);

// POST / - Crear nueva review (requiere autenticación)
router.post('/', authMiddleware, createReview);

// GET /:id - Obtener review por ID (acceso público)
router.get('/:id', getReviewById);

// PUT /:id - Actualizar review (solo propietario o admin)
router.put('/:id', authMiddleware, canAccessResource, updateReview);

// DELETE /:id - Eliminar review (solo propietario o admin)
router.delete('/:id', authMiddleware, canAccessResource, deleteReview);

export default router;
