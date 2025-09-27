import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { Review, CreateReviewRequest, UpdateReviewRequest, ReviewQueryParams } from '../types/review.types';
import { v4 as uuidv4 } from 'uuid';

export class ReviewModel {
  
  static async create(userId: string, reviewData: CreateReviewRequest): Promise<Review> {
    const { productId, rating, comment } = reviewData;
    const id = uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
      INSERT INTO reviews (id, userId, productId, rating, comment, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(query, [id, userId, productId, rating, comment, now, now]);

    return {
      id,
      userId,
      productId,
      rating,
      comment,
      createdAt: now,
      updatedAt: now
    };
  }

  static async findById(id: string): Promise<Review | null> {
    const query = 'SELECT * FROM reviews WHERE id = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  static async findAll(params: ReviewQueryParams = {}): Promise<Review[]> {
    let query = 'SELECT * FROM reviews WHERE 1=1';
    const queryParams: any[] = [];

    // Filtros
    if (params.productId) {
      query += ' AND productId = ?';
      queryParams.push(params.productId);
    }

    if (params.userId) {
      query += ' AND userId = ?';
      queryParams.push(params.userId);
    }

    // Ordenamiento
    const sortBy = params.sortBy || 'date';
    const sortOrder = params.sortOrder || 'desc';
    
    if (sortBy === 'date') {
      query += ` ORDER BY createdAt ${sortOrder.toUpperCase()}`;
    } else if (sortBy === 'rating') {
      query += ` ORDER BY rating ${sortOrder.toUpperCase()}`;
    }

    // Paginación - usar números directamente en lugar de parámetros
    const limit = parseInt(String(params.limit || 10));
    const offset = parseInt(String(params.offset || 0));
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);

    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      productId: row.productId,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  static async findByProductId(productId: string, params: ReviewQueryParams = {}): Promise<Review[]> {
    return this.findAll({ ...params, productId });
  }

  static async findByUserId(userId: string, params: ReviewQueryParams = {}): Promise<Review[]> {
    return this.findAll({ ...params, userId });
  }

  static async update(id: string, updateData: UpdateReviewRequest): Promise<Review | null> {
    const existingReview = await this.findById(id);
    if (!existingReview) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.rating !== undefined) {
      updates.push('rating = ?');
      values.push(updateData.rating);
    }

    if (updateData.comment !== undefined) {
      updates.push('comment = ?');
      values.push(updateData.comment);
    }

    if (updates.length === 0) {
      return existingReview;
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const query = `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM reviews WHERE id = ?';
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  static async getAverageRating(productId: string): Promise<number> {
    const query = 'SELECT AVG(rating) as avgRating FROM reviews WHERE productId = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [productId]);
    
    const avgRating = rows[0]?.avgRating;
    return avgRating ? parseFloat(avgRating) : 0;
  }

  static async getReviewCount(productId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM reviews WHERE productId = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [productId]);
    
    return rows[0]?.count || 0;
  }

  static async checkUserReviewExists(userId: string, productId: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM reviews WHERE userId = ? AND productId = ?';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId, productId]);
    
    return (rows[0]?.count || 0) > 0;
  }

  static async getProductStatistics(productId: string): Promise<any> {
    // Obtener estadísticas básicas
    const [basicStats] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating,
        MIN(rating) as minRating,
        MAX(rating) as maxRating
      FROM reviews 
      WHERE productId = ?
    `, [productId]);

    // Obtener distribución de calificaciones
    const [ratingDistribution] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        rating,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reviews WHERE productId = ?)), 2) as percentage
      FROM reviews 
      WHERE productId = ?
      GROUP BY rating
      ORDER BY rating DESC
    `, [productId, productId]);

    // Obtener reseñas recientes (últimas 5)
    const [recentReviews] = await pool.execute<RowDataPacket[]>(`
      SELECT id, userId, rating, comment, createdAt
      FROM reviews 
      WHERE productId = ?
      ORDER BY createdAt DESC
      LIMIT 5
    `, [productId]);

    const stats = basicStats[0];
    
    return {
      productId,
      totalReviews: stats?.totalReviews || 0,
      averageRating: stats?.averageRating ? Math.round(parseFloat(stats.averageRating) * 10) / 10 : 0,
      minRating: stats?.minRating || 0,
      maxRating: stats?.maxRating || 0,
      ratingDistribution: ratingDistribution.map(row => ({
        rating: row.rating,
        count: row.count,
        percentage: parseFloat(row.percentage)
      })),
      recentReviews: recentReviews.map(row => ({
        id: row.id,
        userId: row.userId,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.createdAt
      }))
    };
  }
}