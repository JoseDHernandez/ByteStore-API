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

/** Common SELECT fields used when returning a review joined with the user */
const REVIEW_SELECT_FIELDS = `
  r.id as id,
  r.product_id as product_id,
  r.user_id as user_id,
  r.qualification as qualification,
  r.comment as comment,
  r.review_date as review_date,
  u.user_name as user_name
`;

/** DB row type for review data with MySQL result metadata */
type ReviewRow = RowDataPacket & ReviewResponseDTO;
/** DB row type for count queries - safe array destructuring */
type CountRow = RowDataPacket & { total: number };
/** DB row type for ownership checks */
type ReviewOwnerRow = RowDataPacket & { user_id: string };

/**
 * Create a new product review
 * Validates input, prevents duplicate reviews per user/product
 * @route POST /reviews
 * @access Authenticated users only
 */
export async function createReview(req: Request, res: Response) {
  try {
    /** Validate request body against schema - throws ZodError if invalid */
    const { product_id, qualification, comment, user_name } =
      createReviewSchema.parse(req.body);
    /** Extract authenticated user ID from JWT token */
    const userId = req.auth!.id;

    /** Check if user already reviewed this product (prevent duplicates) */
    const [existingReview] = await db.query<RowDataPacket[]>(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [product_id, userId]
    );

    /** Return 409 Conflict if review already exists for this user/product pair */
    if (existingReview.length > 0) {
      return res.status(409).json({
        message:
          'Ya has reseñado este producto. Puedes actualizar tu reseña existente.',
      });
    }
    /** Ensure we have the latest user_name stored for the reviewer */
    await db.query<ResultSetHeader>(
      'INSERT INTO users (id, user_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_name = VALUES(user_name)',
      [userId, user_name]
    );

    // Insert new review into database with current timestamp
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO reviews (product_id, user_id, qualification, comment) VALUES (?, ?, ?, ?)',
      [product_id, userId, qualification, comment ?? null]
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
    const conditions: string[] = [];
    const params: Array<string | number> = [];

    if (product_id) {
      conditions.push('r.product_id = ?');
      params.push(product_id);
    }

    if (user_id) {
      conditions.push('r.user_id = ?');
      params.push(user_id);
    }

    if (qualification_min !== undefined) {
      conditions.push('r.qualification >= ?');
      params.push(qualification_min);
    }

    if (qualification_max !== undefined) {
      conditions.push('r.qualification <= ?');
      params.push(qualification_max);
    }

    let baseQuery = `
      SELECT
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM reviews as r';

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      baseQuery += whereClause;
      countQuery += whereClause;
    }

    /** Apply sorting - default is by date descending */
    const sortColumn =
      sort === 'qualification' ? 'r.qualification' : 'r.review_date';
    baseQuery += ` ORDER BY ${sortColumn} ${order}`;

    /** Get total count for pagination metadata */
    const [totalResult] = await db.query<CountRow[]>(countQuery, params);
    const [{ total } = { total: 0 }] = totalResult;

    /** Calculate pagination values */
    const pages = total > 0 ? Math.ceil(total / limit) : 0;
    const currentPage = pages > 0 ? Math.max(1, Math.min(page, pages)) : 1;
    const offset = (currentPage - 1) * limit;
    const first = pages > 0 ? 1 : 0;
    const prev = pages > 0 && currentPage > 1 ? currentPage - 1 : null;
    const next = pages > 0 && currentPage < pages ? currentPage + 1 : null;

    /** Execute main data query */
    const dataParams = [...params, limit, offset];
    const [reviews] = await db.query<ReviewRow[]>(
      `${baseQuery} LIMIT ? OFFSET ?`,
      dataParams
    );

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
    const userId = req.auth!.id;
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    /** Check if review exists and get owner ID */
    const [existingReview] = await db.query<ReviewOwnerRow[]>(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );

    const [reviewOwner] = existingReview;

    if (!reviewOwner) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar permisos (propietario o admin)
    if (!isAdmin && reviewOwner.user_id !== userId) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar esta reseña',
      });
    }

    /** Build dynamic UPDATE query with only provided fields */
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (validatedData.qualification !== undefined) {
      updateFields.push('qualification = ?');
      updateValues.push(validatedData.qualification);
    }

    if (validatedData.comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(validatedData.comment);
    }

    /** Return 400 if no fields provided for update */
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    /** Add review ID as final parameter */
    updateValues.push(id);

    /** Execute UPDATE query */
    await db.query(
      `UPDATE reviews SET ${updateFields.join(', ')} WHERE id = ?`,
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
    const userId = req.auth!.id;
    const isAdmin = req.auth!.role === 'ADMINISTRADOR';

    /** Check review existence and ownership */
    const [existingReview] = await db.query<ReviewOwnerRow[]>(
      'SELECT user_id FROM reviews WHERE id = ?',
      [id]
    );

    const [reviewOwner] = existingReview;

    if (!reviewOwner) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar permisos (propietario o admin)
    if (!isAdmin && reviewOwner.user_id !== userId) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar esta reseña',
      });
    }

    /** Delete review from database */
    await db.query('DELETE FROM reviews WHERE id = ?', [id]);

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
    const { product_id } = productIdSchema.parse(req.params);
    /** Validate pagination/sorting query params */
    const validatedQuery = reviewsQuerySchema.parse({
      ...req.query,
      product_id,
    });
    const {
      page,
      limit,
      sort,
      order,
      user_id,
      qualification_min,
      qualification_max,
    } = validatedQuery;

    /** Query for product-specific reviews */
    const conditions: string[] = ['r.product_id = ?'];
    const params: Array<string | number> = [product_id];

    if (user_id) {
      conditions.push('r.user_id = ?');
      params.push(user_id);
    }

    if (qualification_min !== undefined) {
      conditions.push('r.qualification >= ?');
      params.push(qualification_min);
    }

    if (qualification_max !== undefined) {
      conditions.push('r.qualification <= ?');
      params.push(qualification_max);
    }

    let baseQuery = `
      SELECT 
        ${REVIEW_SELECT_FIELDS}
      FROM reviews as r INNER JOIN users as u ON r.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM reviews as r';

    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    baseQuery += whereClause;
    countQuery += whereClause;

    /** Apply sorting (date or rating) */
    const sortColumn =
      sort === 'qualification' ? 'r.qualification' : 'r.review_date';
    baseQuery += ` ORDER BY ${sortColumn} ${order}`;

    /** Get total count for this product */
    const [totalResult] = await db.query<CountRow[]>(countQuery, params);
    /** Safe destructuring with default value */
    const [{ total } = { total: 0 }] = totalResult;

    /** Calculate pagination metadata */
    const pages = total > 0 ? Math.ceil(total / limit) : 0;
    const currentPage = pages > 0 ? Math.max(1, Math.min(page, pages)) : 1;
    const offset = (currentPage - 1) * limit;
    const first = pages > 0 ? 1 : 0;
    const prev = pages > 0 && currentPage > 1 ? currentPage - 1 : null;
    const next = pages > 0 && currentPage < pages ? currentPage + 1 : null;

    /** Execute query with product ID and pagination params */
    const [reviews] = await db.query<ReviewRow[]>(
      `${baseQuery} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

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
