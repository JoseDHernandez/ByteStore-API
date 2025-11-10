/** Express request and response types */
import type { Request, Response } from 'express';
/** MySQL database connection pool */
import { db } from '../db.ts';
/** MySQL result types for type-safe queries */
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
/** Review DTOs and response types */
import type {
  ReviewResponseDTO,
  ReviewsPaginatedResponse,
} from '../types/review.ts';
/** Zod validation schemas for request validation */
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  reviewsQuerySchema,
  productIdSchema,
} from '../schemas/review.schema.ts';

/** DB row type for review data with MySQL result metadata */
type ReviewRow = RowDataPacket & ReviewResponseDTO;
/** DB row type for count queries - safe array destructuring */
type CountRow = RowDataPacket & { total: number };
/** DB row type for ownership checks */
type ReviewOwnerRow = RowDataPacket & { usuario_id: string };

/**
 * Create a new product review
 * Validates input, prevents duplicate reviews per user/product
 * @route POST /reviews
 * @access Authenticated users only
 */
export async function createReview(req: Request, res: Response) {
  try {
    /** Validate request body against schema - throws ZodError if invalid */
    const validatedData = createReviewSchema.parse(req.body);
    /** Extract authenticated user ID from JWT token */
    const usuario_id = req.auth!.id;

    /** Check if user already reviewed this product (prevent duplicates) */
    const [existingReview] = await db.query<RowDataPacket[]>(
      'SELECT calificacion_id FROM calificaciones WHERE producto_id = ? AND usuario_id = ?',
      [validatedData.producto_id, usuario_id]
    );

    /** Return 409 Conflict if review already exists for this user/product pair */
    if (existingReview.length > 0) {
      return res.status(409).json({
        message:
          'Ya has reseñado este producto. Puedes actualizar tu reseña existente.',
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

    /** Insert new review into database with current timestamp */
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO calificaciones (producto_id, usuario_id, calificacion, comentario, fecha) VALUES (?, ?, ?, ?, NOW())',
      [
        validatedData.producto_id,
        usuario_id,
        validatedData.calificacion,
        validatedData.comentario || null,
      ]
    );

    /** Fetch the newly created review to return complete data */
    const [newReview] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      data: newReview[0],
    });
  } catch (error: any) {
    /** Handle Zod validation errors with 400 Bad Request */
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Datos de entrada inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al crear reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Retrieve reviews with pagination and filtering
 * Supports filtering by product, user, rating range
 * Supports sorting by date or rating
 * @route GET /reviews
 * @access Public
 */
export async function getReviews(req: Request, res: Response) {
  try {
    /** Validate query parameters (page, limit, filters, sort) */
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

    /** Build dynamic SQL query with filters */
    let baseQuery = `
      SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id 
    `;

    /** Count query for total results (same filters as main query) */
    let countQuery = 'SELECT COUNT(*) as total FROM calificaciones c WHERE 1=1';
    /** Parameterized query values - prevents SQL injection */
    const queryParams: any[] = [];

    /** Apply optional filters based on query parameters */
    if (producto_id) {
      baseQuery += ' AND c.producto_id = ?';
      countQuery += ' AND c.producto_id = ?';
      queryParams.push(producto_id);
    }

    if (usuario_id) {
      baseQuery += ' AND c.usuario_id = ?';
      countQuery += ' AND c.usuario_id = ?';
      queryParams.push(usuario_id);
    }

    if (calificacion_min) {
      baseQuery += ' AND c.calificacion >= ?';
      countQuery += ' AND c.calificacion >= ?';
      queryParams.push(calificacion_min);
    }

    if (calificacion_max) {
      baseQuery += ' AND c.calificacion <= ?';
      countQuery += ' AND c.calificacion <= ?';
      queryParams.push(calificacion_max);
    }

    /** Apply sorting - default is by date descending */
    if (sort === 'fecha') {
      baseQuery += ` ORDER BY c.fecha ${order}`;
    } else if (sort === 'calificacion') {
      baseQuery += ` ORDER BY c.calificacion ${order}`;
    }

    /** Get total count for pagination metadata */
    const [totalResult] = await db.query<CountRow[]>(countQuery, queryParams);
    /** Safe destructuring - defaults to 0 if no results */
    const [{ total } = { total: 0 }] = totalResult;

    /** Calculate pagination values */
    const pages = Math.ceil(total / limit);
    /** Clamp current page to valid range [1, pages] */
    const currentPage = Math.max(1, Math.min(page, pages));
    const offset = (currentPage - 1) * limit;
    const first = 1;
    /** Previous page link (null if on first page) */
    const prev = currentPage > 1 ? currentPage - 1 : null;
    /** Next page link (null if on last page) */
    const next = currentPage < pages ? currentPage + 1 : null;

    /** Add pagination to query */
    baseQuery += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    /** Execute main data query */
    const [reviews] = await db.query<ReviewRow[]>(baseQuery, queryParams);

    /** Build standardized pagination response */
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
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Parámetros de consulta inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Retrieve a single review by ID
 * @route GET /reviews/:id
 * @access Public
 */
export async function getReviewById(req: Request, res: Response) {
  try {
    /** Validate review ID from route params */
    const { id } = reviewIdSchema.parse(req.params);

    /** Query review by primary key */
    const [review] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );

    if (review.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.status(200).json(review[0]);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'ID inválido',
        errors: error.errors,
      });
    }
    console.error('Error al obtener reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Update an existing review
 * Only owner or admin can update
 * Supports partial updates (rating and/or comment)
 * @route PUT /reviews/:id
 * @access Owner or Admin only
 */
export async function updateReview(req: Request, res: Response) {
  try {
    /** Validate review ID and update data */
    const { id } = reviewIdSchema.parse(req.params);
    const validatedData = updateReviewSchema.parse(req.body);
    /** Get authenticated user info from token */
    const usuario_id = req.auth!.id;
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    /** Check if review exists and get owner ID */
    const [existingReview] = await db.query<ReviewOwnerRow[]>(
      'SELECT usuario_id FROM calificaciones WHERE calificacion_id = ?',
      [id]
    );

    const [reviewOwner] = existingReview;

    if (!reviewOwner) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar permisos (propietario o admin)
    if (!isAdmin && reviewOwner.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar esta reseña',
      });
    }

    /** Build dynamic UPDATE query with only provided fields */
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    /** Add rating field if present in request */
    if (validatedData.calificacion !== undefined) {
      updateFields.push('calificacion = ?');
      updateValues.push(validatedData.calificacion);
    }

    if (validatedData.comentario !== undefined) {
      updateFields.push('comentario = ?');
      updateValues.push(validatedData.comentario);
    }

    /** Return 400 if no fields provided for update */
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    /** Add review ID as final parameter */
    updateValues.push(id);

    /** Execute UPDATE query */
    await db.query(
      `UPDATE calificaciones SET ${updateFields.join(
        ', '
      )} WHERE calificacion_id = ?`,
      updateValues
    );

    /** Fetch updated review to return complete data */
    const [updatedReview] = await db.query<ReviewRow[]>(
      `SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.id = ?`,
      [id]
    );

    res.status(200).json({
      message: 'Reseña actualizada exitosamente',
      data: updatedReview[0],
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Delete a review
 * Only owner or admin can delete
 * @route DELETE /reviews/:id
 * @access Owner or Admin only
 */
export async function deleteReview(req: Request, res: Response) {
  try {
    /** Validate review ID */
    const { id } = reviewIdSchema.parse(req.params);
    /** Get user info from JWT */
    const usuario_id = req.auth!.id;
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    /** Check review existence and ownership */
    const [existingReview] = await db.query<ReviewOwnerRow[]>(
      'SELECT usuario_id FROM calificaciones WHERE calificacion_id = ?',
      [id]
    );

    const [reviewOwner] = existingReview;

    if (!reviewOwner) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar permisos (propietario o admin)
    if (!isAdmin && reviewOwner.usuario_id !== usuario_id) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar esta reseña',
      });
    }

    /** Delete review from database */
    await db.query('DELETE FROM calificaciones WHERE calificacion_id = ?', [
      id,
    ]);

    res.status(200).json({ message: 'Reseña eliminada exitosamente' });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'ID inválido',
        errors: error.errors,
      });
    }
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

/**
 * Get all reviews for a specific product
 * Supports pagination and sorting
 * @route GET /products/:producto_id/reviews
 * @access Public
 */
export async function getReviewsByProduct(req: Request, res: Response) {
  try {
    /** Validate product ID from route params */
    const { producto_id } = productIdSchema.parse(req.params);
    /** Validate pagination/sorting query params */
    const validatedQuery = reviewsQuerySchema.parse(req.query);
    const { page, limit, sort, order } = validatedQuery;

    /** Query for product-specific reviews */
    let baseQuery = `
      SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
      WHERE r.product_id = ? 
    `;

    /** Apply sorting (date or rating) */
    if (sort === 'fecha') {
      baseQuery += ` ORDER BY c.fecha ${order}`;
    } else if (sort === 'calificacion') {
      baseQuery += ` ORDER BY c.calificacion ${order}`;
    }

    /** Get total count for this product */
    const [totalResult] = await db.query<CountRow[]>(
      'SELECT COUNT(*) as total FROM calificaciones WHERE producto_id = ?',
      [producto_id]
    );
    /** Safe destructuring with default value */
    const [{ total } = { total: 0 }] = totalResult;

    /** Calculate pagination metadata */
    const pages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, pages));
    const offset = (currentPage - 1) * limit;
    const first = 1;
    const prev = currentPage > 1 ? currentPage - 1 : null;
    const next = currentPage < pages ? currentPage + 1 : null;

    /** Add LIMIT and OFFSET */
    baseQuery += ' LIMIT ? OFFSET ?';

    /** Execute query with product ID and pagination params */
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
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Parámetros inválidos',
        errors: error.errors,
      });
    }
    console.error('Error al obtener reseñas del producto:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
