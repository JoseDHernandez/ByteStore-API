import type { Request, Response } from "express";
import { db } from "../db.ts";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type {
  ReviewResponseDTO,
  ReviewsPaginatedResponse,
} from "../types/review.ts";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  reviewsQuerySchema,
  productIdSchema,
} from "../schemas/review.schema.ts";
import { REVIEW_SELECT_FIELDS } from "../utils/sql.ts";
import { computePagination } from "../utils/pagination.ts";

type ReviewRow = RowDataPacket & ReviewResponseDTO;

// Crear una nueva reseña
export async function createReview(req: Request, res: Response) {
  try {
    // Validar datos de entrada
    const validatedData = createReviewSchema.parse(req.body);
    const user_id = req.auth?.id;

    // Verificar si el usuario ya ha reseñado este producto
    const [existingReview] = await db.query<RowDataPacket[]>(
      "SELECT id FROM reviews WHERE product_id = ? AND user_id = ?",
      [validatedData.product_id, user_id]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({
        message:
          "Ya has reseñado este producto. Puedes actualizar tu reseña existente.",
      });
    }
    const data = validatedData;
    // Consultar usuario existente

    const [existingUser] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id=?",
      [user_id]
    );
    //crear usuario
    if (existingUser.length === 0) {
      const [registerUser] = await db.query<ResultSetHeader>(
        "INSERT INTO users (id, user_name) VALUES (?,?)",
        [user_id, data.user_name]
      );
    }

    // Crear la reseña
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO reviews (product_id, user_id, qualification, comment, review_date) VALUES (?, ?, ?, ?, NOW())",
      [data.product_id, user_id, data.qualification, data.comment]
    );

    // Obtener la reseña creada
    const [newReview] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [result.insertId]
    );
    //retornar
    res
      .status(201)
      .json({ message: "Calificación creada", data: newReview[0] });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Datos de entrada inválidos",
        errors: error.errors,
      });
    }
    console.error("Error al crear reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Obtener reseñas con paginación y filtros
type totalQuery = RowDataPacket & {
  total: number;
};
export async function getReviews(req: Request, res: Response) {
  try {
    // Validar parámetros de consulta
    const validatedQuery = reviewsQuerySchema.parse(req.query);
    const {
      page,
      limit,
      product_id,
      user_id,
      sort,
      order,
      qualification_min,
      qualification_max,
    } = validatedQuery;

    // Construir la consulta base
    let baseQuery = `
      SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id 
    `;

    let countQuery = "SELECT COUNT(*) as total FROM reviews as r ";
    const conditions: string[] = [];
    const queryParams: any[] = [];

    // Aplicar filtros
    if (product_id) {
      conditions.push("r.product_id = ?");
      queryParams.push(product_id);
    }

    if (user_id) {
      conditions.push("r.user_id = ?");
      queryParams.push(user_id);
    }

    if (qualification_min) {
      conditions.push("r.qualification >= ?");
      queryParams.push(qualification_min);
    }

    if (qualification_max) {
      conditions.push("r.qualification <= ?");
      queryParams.push(qualification_max);
    }
    // agregar condicionales
    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    // Aplicar ordenamiento
    if (sort === "review_date") {
      baseQuery += ` ORDER BY r.review_date ${order}`;
    } else if (sort === "qualification") {
      baseQuery += ` ORDER BY r.qualification ${order}`;
    }

    // Obtener total de registros
    const [totalResult] = await db.query<totalQuery[]>(countQuery, queryParams);
    const total = totalResult[0]?.total ?? 1;

    // Calcular paginación
    const { pages, currentPage, offset, first, prev, next } = computePagination(
      total,
      limit,
      page
    );

    // Aplicar paginación
    baseQuery += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Ejecutar consulta
    const [reviews] = await db.query<ReviewRow[]>(baseQuery, queryParams);

    const response: ReviewsPaginatedResponse = {
      total,
      pages,
      first,
      next,
      prev,
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Parámetros de consulta inválidos",
        errors: error.errors,
      });
    }
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Obtener reseña por ID
export async function getReviewById(req: Request, res: Response) {
  try {
    // Validar parámetro ID
    const { id } = reviewIdSchema.parse(req.params);

    // Buscar la reseña
    const [review] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    res.status(200).json(review[0]);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "ID inválido",
        errors: error.errors,
      });
    }
    console.error("Error al obtener reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Actualizar reseña
type existingReviewQuery = RowDataPacket & {
  user_id: string | undefined;
};
export async function updateReview(req: Request, res: Response) {
  try {
    // Validar parámetro ID y datos
    const { id } = reviewIdSchema.parse(req.params);
    const validatedData = updateReviewSchema.parse(req.body);

    // Verificar que la reseña existe
    const [existingReview] = await db.query<existingReviewQuery[]>(
      "SELECT user_id FROM reviews WHERE id = ?",
      [id]
    );

    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Validar autorización: solo propietario o administrador
    const isAdmin = req.auth?.role === "ADMINISTRADOR";
    const usuario_id = Number(req.auth?.id);
    const ownerId = existingReview[0]!.user_id
      ? Number(existingReview[0]!.user_id)
      : undefined;
    if (!isAdmin && ownerId !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permisos para actualizar esta reseña",
      });
    }

    // Construir consulta de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (validatedData.qualification !== undefined) {
      updateFields.push("qualification = ?");
      updateValues.push(validatedData.qualification);
    }

    if (validatedData.comment !== undefined) {
      updateFields.push("comment = ?");
      updateValues.push(validatedData.comment);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    updateValues.push(id);

    // Actualizar la reseña
    await db.query(
      `UPDATE reviews SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Obtener la reseña actualizada
    const [updatedReview] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );

    res
      .status(200)
      .json({ message: "Calificación actualizada", data: updatedReview[0] });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: error.errors,
      });
    }
    console.error("Error al actualizar reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Eliminar reseña
export async function deleteReview(req: Request, res: Response) {
  try {
    // Validar parámetro ID
    const { id } = reviewIdSchema.parse(req.params);

    // Verificar que la reseña existe
    const [existingReview] = await db.query<RowDataPacket[]>(
      "SELECT user_id FROM reviews WHERE id = ?",
      [id]
    );

    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Reseña no encontrada" });
    }

    // Validar autorización: solo propietario o administrador
    const isAdmin = req.auth?.role === "ADMINISTRADOR";
    const usuario_id = Number(req.auth?.id);
    const ownerId = existingReview[0]!.user_id
      ? Number(existingReview[0]!.user_id)
      : undefined;
    if (!isAdmin && ownerId !== usuario_id) {
      return res.status(403).json({
        message: "No tienes permisos para eliminar esta reseña",
      });
    }

    // Eliminar la reseña
    await db.query("DELETE FROM reviews WHERE id = ?", [id]);

    res.status(200).json({ message: "Reseña eliminada exitosamente" });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "ID inválido",
        errors: error.errors,
      });
    }
    console.error("Error al eliminar reseña:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Obtener reseñas por producto
export async function getReviewsByProduct(req: Request, res: Response) {
  try {
    // Validar parámetro product_id
    const { product_id } = productIdSchema.parse(req.params);
    const validatedQuery = reviewsQuerySchema.parse(req.query);
    const { page, limit, sort, order } = validatedQuery;

    // Consulta base para reseñas del producto
    let baseQuery = `
      SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.product_id = ? 
    `;

    // Aplicar ordenamiento
    if (sort === "review_date") {
      baseQuery += ` ORDER BY r.review_date ${order}`;
    } else if (sort === "qualification") {
      baseQuery += ` ORDER BY r.qualification ${order}`;
    }

    // Obtener total de registros
    const [totalResult] = await db.query<totalQuery[]>(
      "SELECT COUNT(*) as total FROM reviews WHERE product_id = ?",
      [product_id]
    );
    const total = totalResult[0]?.total ?? 1;

    // Calcular paginación
    const { pages, currentPage, offset, first, prev, next } = computePagination(
      total,
      limit,
      page
    );

    // Aplicar paginación
    baseQuery += " LIMIT ? OFFSET ?";

    // Ejecutar consulta
    const [reviews] = await db.query<ReviewRow[]>(baseQuery, [
      product_id,
      limit,
      offset,
    ]);

    const response: ReviewsPaginatedResponse = {
      total,
      pages,
      first,
      next,
      prev,
      data: reviews,
    };

    res.status(200).json(response);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Parámetros inválidos",
        errors: error.errors,
      });
    }
    console.error("Error al obtener reseñas del producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
