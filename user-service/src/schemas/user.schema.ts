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
  id: z.uuidv7().trim(),
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
//Actualizar contraseña
export const updatePasswordSchema = z.object({
  id: z.uuidv7().trim(),
  password: z
    .string()
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
  id: z.uuidv7().trim(),
  password: z
    .string()
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
  id: z.uuidv7().trim(),
});
//Actualizar rol
export const changeRoleSchema = z.object({
  id: z.uuidv7("Expected uuidv7").trim(),
  role: z.enum(["administrador", "cliente"]),
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
