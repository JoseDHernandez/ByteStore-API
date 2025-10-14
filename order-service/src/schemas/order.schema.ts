import { z } from "zod";

// Esquema para crear una nueva orden
export const createOrderSchema = z.object({
  user_id: z
    .string()
    .trim()
    .min(1, "El ID del usuario es requerido"),
  correo_usuario: z
    .string()
    .email("Email inválido")
    .trim()
    .min(5, "El email debe tener al menos 5 caracteres")
    .max(300, "El email no puede exceder 300 caracteres"),
  direccion: z
    .string()
    .trim()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.,#°-]+$/,
      "La dirección contiene caracteres no válidos"
    )
    .optional(),
  tipo_entrega: z.enum(["domicilio", "recoger"]).default("domicilio"),
  geolocalizacion_habilitada: z.boolean().default(false),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  nombre_completo: z
    .string()
    .trim()
    .min(6, "El nombre completo debe tener al menos 6 caracteres")
    .max(200, "El nombre completo no puede exceder 200 caracteres")
    .regex(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
      "El nombre solo puede contener letras y espacios"
    ),
  metodo_pago: z.enum(["tarjeta", "pse", "efectivo"]).default("tarjeta"),
  tarjeta: z
    .object({
      tipo: z.enum(["debito", "credito"]),
      marca: z.enum(["VISA", "MASTERCARD"]),
      numero: z
        .string()
        .regex(/^[0-9]{12,19}$/i, "El número de tarjeta debe tener 12-19 dígitos"),
    })
    .optional(),
  pse_reference: z.string().trim().max(100).optional(),
  cash_on_delivery: z.boolean().optional(),
  productos: z
    .array(
      z.object({
        producto_id: z
          .number()
          .int("El ID del producto debe ser un número entero")
          .positive("El ID del producto debe ser positivo"),
        cantidad: z
          .number()
          .int("La cantidad debe ser un número entero")
          .positive("La cantidad debe ser positiva")
          .max(100, "La cantidad máxima por producto es 100"),
      })
    )
    .min(1, "Debe incluir al menos un producto")
    .max(50, "No se pueden incluir más de 50 productos por orden"),
}).superRefine((data, ctx) => {
  // Si geolocalización está habilitada debe incluir latitud y longitud
  if (data.geolocalizacion_habilitada) {
    if (typeof data.latitud !== 'number' || typeof data.longitud !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitud'],
        message: 'Debe proporcionar latitud y longitud cuando la geolocalización está habilitada',
      });
    }
  }
  // Para entrega a domicilio: requiere dirección si no hay geolocalización válida
  if (data.tipo_entrega === 'domicilio') {
    const hasGeo = !!data.geolocalizacion_habilitada && typeof data.latitud === 'number' && typeof data.longitud === 'number';
    if (!hasGeo && !data.direccion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['direccion'],
        message: 'Para entrega a domicilio sin geolocalización, la dirección es requerida',
      });
    }
  }
});

// Esquema para actualizar una orden
export const updateOrderSchema = z.object({
  estado: z
    .enum(["en_proceso", "cancelado", "retrasado", "entregado"])
    .optional(),
  direccion: z
    .string()
    .trim()
    .min(10, "La dirección debe tener al menos 10 caracteres")
    .max(500, "La dirección no puede exceder 500 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.,#°-]+$/,
      "La dirección contiene caracteres no válidos"
    )
    .optional(),
  fecha_entrega_original: z
    .string()
    .datetime({ message: "Formato de fecha inválido. Use formato ISO 8601" })
    .optional(),
  fecha_entrega_retrasada: z
    .string()
    .datetime({ message: "Formato de fecha inválido. Use formato ISO 8601" })
    .optional(),
  tipo_entrega: z.enum(["domicilio", "recoger"]).optional(),
  geolocalizacion_habilitada: z.boolean().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  metodo_pago: z.enum(["tarjeta", "pse", "efectivo"]).optional(),
  tarjeta: z
    .object({
      tipo: z.enum(["debito", "credito"]),
      marca: z.enum(["VISA", "MASTERCARD"]),
      numero: z
        .string()
        .regex(/^[0-9]{12,19}$/i, "El número de tarjeta debe tener 12-19 dígitos"),
    })
    .optional(),
  pse_reference: z.string().trim().max(100).optional(),
  cash_on_delivery: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Si geolocalización está habilitada en actualización, exigir lat/long
  if (data.geolocalizacion_habilitada) {
    if (typeof data.latitud !== 'number' || typeof data.longitud !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['latitud'],
        message: 'Debe proporcionar latitud y longitud cuando habilita geolocalización',
      });
    }
  }
});

// Esquema para parámetros de ID de orden
export const orderIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID de la orden debe ser un número positivo",
    }),
});

// Esquema para consultas paginadas de órdenes
export const ordersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  user_id: z.string().trim().optional(),
  estado: z
    .enum(["en_proceso", "cancelado", "retrasado", "entregado"])
    .optional(),
  fecha_desde: z
    .string()
    .datetime({ message: "Formato de fecha inválido. Use formato ISO 8601" })
    .optional(),
  fecha_hasta: z
    .string()
    .datetime({ message: "Formato de fecha inválido. Use formato ISO 8601" })
    .optional(),
  sort: z.enum(["fecha_pago", "total", "estado"]).default("fecha_pago"),
  order: z.enum(["ASC", "DESC"]).default("DESC"),
});

// Esquema para parámetros de usuario
export const userIdSchema = z.object({
  user_id: z.string().trim().min(1, "El ID del usuario es requerido"),
});