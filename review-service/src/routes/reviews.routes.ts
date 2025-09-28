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

// GET / - Obtener reviews paginadas
router.get("/", getReviews);

// POST / - Crear nueva review
router.post("/", authMiddleware, createReview);

// GET /:id - Obtener review por ID
router.get("/:id", canAccessResource, getReviewById);

// PUT /:id - Actualizar review (solo propietario o admin)
router.put("/:id", canAccessResource, updateReview);

// DELETE /:id - Eliminar review (solo propietario o admin)
router.delete("/:id", canAccessResource, deleteReview);

export default router;
