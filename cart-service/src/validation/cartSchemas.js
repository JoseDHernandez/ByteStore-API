const { z } = require('zod');


const createCartSchema = z.object({
  user_id: z.string().uuid({ message: 'user_id debe ser un UUID válido' }),
  products: z.array(
    z.object({
      id: z.number().int().gte(1),
      name: z
        .string()
        .trim()
        .min(5)
        .max(40)
        .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/),
      model: z
        .string()
        .trim()
        .min(5)
        .max(36)
        .regex(/^[\w\d\-\/\\]+$/),
      price: z.number().gte(100000.0).lte(20000000.0),
      discount: z.number().gte(0).lte(90),
      stock: z.number().int().positive(),
      image: z.string().url(),
      brand: z
        .string()
        .trim()
        .min(2)
        .max(10)
        .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/),
      quantity: z.number().int().gte(1),
    })
  ),
});

const updateCartSchema = z.object({
  products: z.array(
    z.object({
      id: z.number().int().gte(1),
      name: z
        .string()
        .trim()
        .min(5)
        .max(40)
        .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/),
      model: z
        .string()
        .trim()
        .min(5)
        .max(36)
        .regex(/^[\w\d\-\/\\]+$/),
      price: z.number().gte(100000.0).lte(20000000.0),
      discount: z.number().gte(0).lte(90),
      stock: z.number().int().positive(),
      image: z.string().url(),
      brand: z
        .string()
        .trim()
        .min(2)
        .max(10)
        .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\-]+$/),
      quantity: z.number().int().gte(1),
    })
  ),
});

module.exports = {
  createCartSchema,
  updateCartSchema,
};
