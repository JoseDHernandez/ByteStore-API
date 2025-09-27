import { z } from 'zod';
import { OrderStatus } from '../types/order.types';

// Schema para direcciones
const addressSchema = z.object({
  firstName: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  lastName: z.string()
    .min(1, 'El apellido es requerido')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .trim(),
  company: z.string()
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .trim()
    .optional(),
  address1: z.string()
    .min(1, 'La dirección es requerida')
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .trim(),
  address2: z.string()
    .max(255, 'La dirección secundaria no puede exceder 255 caracteres')
    .trim()
    .optional(),
  city: z.string()
    .min(1, 'La ciudad es requerida')
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .trim(),
  state: z.string()
    .min(1, 'El estado/departamento es requerido')
    .max(100, 'El estado no puede exceder 100 caracteres')
    .trim(),
  postalCode: z.string()
    .min(1, 'El código postal es requerido')
    .max(20, 'El código postal no puede exceder 20 caracteres')
    .trim(),
  country: z.string()
    .min(1, 'El país es requerido')
    .max(100, 'El país no puede exceder 100 caracteres')
    .trim(),
  phone: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .trim()
    .optional()
});

// Schema para items de orden
const createOrderItemSchema = z.object({
  productId: z.string().uuid('El ID del producto debe ser un UUID válido'),
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1')
    .max(100, 'La cantidad máxima es 100')
});

// Schema para crear orden
export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema)
    .min(1, 'Debe incluir al menos un producto')
    .max(50, 'No puede incluir más de 50 productos'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  paymentMethod: z.string()
    .min(1, 'El método de pago es requerido')
    .max(50, 'El método de pago no puede exceder 50 caracteres')
    .trim(),
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
});

// Schema para actualizar estado de orden
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: 'Estado de orden inválido'
  }),
  trackingNumber: z.string()
    .max(100, 'El número de seguimiento no puede exceder 100 caracteres')
    .trim()
    .optional(),
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .trim()
    .optional()
});

// Schema para parámetros de consulta
export const orderQuerySchema = z.object({
  page: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().int().min(1))
    .optional()
    .default(1)
    .transform(val => typeof val === 'string' ? parseInt(val) : val),
  limit: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(10)
    .transform(val => typeof val === 'string' ? parseInt(val) : val),
  status: z.nativeEnum(OrderStatus).optional(),
  startDate: z.string()
    .datetime('Fecha de inicio inválida')
    .optional(),
  endDate: z.string()
    .datetime('Fecha de fin inválida')
    .optional(),
  sortBy: z.enum(['order_date', 'totalAmount', 'status'])
    .optional()
    .default('order_date'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La fecha de inicio debe ser anterior a la fecha de fin'
});

// Schema para validar UUID
export const uuidSchema = z.object({
  id: z.string().uuid('Debe ser un UUID válido')
});

// Schema para parámetros de paginación simple
export const paginationSchema = z.object({
  page: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().int().min(1))
    .optional()
    .default(1)
    .transform(val => typeof val === 'string' ? parseInt(val) : val),
  limit: z.string()
    .transform(val => parseInt(val))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(10)
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
});

// Schema para validar estado de orden
export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    message: 'Estado de orden inválido'
  })
});