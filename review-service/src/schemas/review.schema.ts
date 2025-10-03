import { z } from "zod";

// Esquema para crear una nueva reseña
export const createReviewSchema = z.object({
  product_id: z
    .number()
    .int("El ID del producto debe ser un número entero")
    .positive("El ID del producto debe ser positivo"),
  qualification: z.number().max(5),
  user_name: z
    .string()
    .min(5)
    .max(50)
    .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/),
  comment: z
    .string()
    .trim()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.,;:!?¿¡()"'-]+$/,
      "El comentario contiene caracteres no válidos"
    ),
});

// Esquema para actualizar una reseña
export const updateReviewSchema = z.object({
  qualification: z.number().max(5),
  comment: z
    .string()
    .trim()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.,;:!?¿¡()"'-]+$/,
      "El comentario contiene caracteres no válidos"
    )
    .optional(),
});

// Esquema para parámetros de ID
export const reviewIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número positivo",
    }),
});

// Esquema para consultas paginadas de reseñas
export const reviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  product_id: z.coerce.number().int().positive().optional(),
  user_id: z.string().trim().optional(),
  sort: z.enum(["review_date", "qualification"]).default("review_date"),
  order: z.enum(["ASC", "DESC"]).default("DESC"),
  qualification_min: z.coerce.number().int().min(1).max(5).optional(),
  qualification_max: z.coerce.number().int().min(1).max(5).optional(),
});

// Esquema para validar producto_id en parámetros
export const productIdSchema = z.object({
  product_id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID del producto debe ser un número positivo",
    }),
});
