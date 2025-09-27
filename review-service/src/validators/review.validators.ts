import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid('El ID del producto debe ser un UUID válido'),
  rating: z.number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comment: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim()
});

export const updateReviewSchema = z.object({
  rating: z.number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  comment: z.string()
    .min(1, 'El comentario no puede estar vacío')
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim()
    .optional()
}).refine(data => data.rating !== undefined || data.comment !== undefined, {
  message: 'Debe proporcionar al menos un campo para actualizar (rating o comment)'
});

export const reviewQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  sortBy: z.enum(['date', 'rating']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.string().transform(val => parseInt(val)).pipe(
    z.number().int().min(1).max(100)
  ).optional().default(10),
  offset: z.string().transform(val => parseInt(val)).pipe(
    z.number().int().min(0)
  ).optional().default(0)
});

export const uuidSchema = z.string().uuid('Debe ser un UUID válido');