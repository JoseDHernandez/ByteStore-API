import { z } from "zod";
//Registro
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(6, "Debe tener al menos 6 caracteres")
    .max(200, "No puede exceder 200 caracteres")
    .regex(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
      "Solo letras y espacios para el nombre"
    ),
  email: z
    .email("Email inválido")
    .trim()
    .min(5, "El email debe tener al menos 5 caracteres")
    .max(300, "El email no puede exceder 300 caracteres")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email no válido"),
  password: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(20, "La contraseña no debe exceder los 20 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "La contraseña debe incluir mayúscula, minúscula, número y carácter especial"
    ),
  physical_address: z
    .string()
    .trim()
    .min(2, "La dirección es muy corta")
    .max(100, "La dirección no debe exceder 100 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.\,'"#°\-]+$/,
      "Caracteres inválidos en la dirección"
    ),
});
//Ingreso
export const loginSchema = z.object({
  email: z
    .email("Email inválido")
    .trim()
    .min(5, "El email debe tener al menos 5 caracteres")
    .max(300, "El email no puede exceder 300 caracteres")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email no válido"),

  password: z
    .string("Contraseña requerida")
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(20, "La contraseña no debe exceder los 20 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "La contraseña debe tener mayúsculas, minúsculas, número y carácter especial"
    ),
});
//Actualizar
export const updateSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
  name: z
    .string({ message: "El nombre es requerido" })
    .trim()
    .min(6, "Debe tener al menos 6 caracteres")
    .max(200, "No puede exceder 200 caracteres")
    .regex(
      /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
      "Solo letras y espacios para el nombre"
    ),
  email: z
    .email({ message: "El email es requerido" })
    .trim()
    .min(5, "El email debe tener al menos 5 caracteres")
    .max(300, "El email no puede exceder 300 caracteres")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email no válido"),
  physical_address: z
    .string({ message: "La dirección es requerida" })
    .trim()
    .min(2, "La dirección es muy corta")
    .max(100, "La dirección no debe exceder 100 caracteres")
    .regex(
      /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s\.\,'"#°\-]+$/,
      "Caracteres inválidos en la dirección"
    ),
});

//Actualizar contraseña
export const updatePasswordSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
  password: z
    .string({ message: "La contraseña es requerida" })
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(20, "La contraseña no debe exceder los 20 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "La contraseña debe incluir mayúscula, minúscula, número y carácter especial"
    ),
});

//Eliminar
export const deleteSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
  password: z
    .string({ message: "La contraseña es requerida" })
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(20, "La contraseña no debe exceder los 20 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
      "La contraseña debe incluir mayúscula, minúscula, número y carácter especial"
    ),
});

//Eliminar por administrador
export const uuidSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
});

//Actualizar rol
export const changeRoleSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
  role: z
    .enum(["administrador", "cliente"], {
      message: "El rol debe ser administrador o cliente",
    })
    .pipe(z.transform((val) => val.toLowerCase())),
});

//validar id
export const userIdSchema = z.object({
  id: z.uuidv7({ message: "El id debe ser un UUIDv7 válido" }),
});

//Buscar usuario
export const searchUserSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z
    .string()
    .trim()
    .min(6, "Debe tener al menos 6 caracteres")
    .max(200, "No puede exceder 200 caracteres")
    .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, "Solo letras y espacios para el nombre")
    .default(""),
});
