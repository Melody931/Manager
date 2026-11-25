import { z } from "zod";

// Datos necesarios para registrar un negocio y su usuario administrador.
export const registroSchema = z.object({
  negocioNombre: z
    .string()
    .trim()
    .min(1, "El nombre del negocio es obligatorio."),

  negocioTipo: z
    .string()
    .trim()
    .min(1, "El tipo de negocio es obligatorio."),

  nombre: z
    .string()
    .trim()
    .min(1, "El nombre del administrador es obligatorio."),

  email: z
    .string()
    .email("Introduce un correo electrónico válido."),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria."),
});

// Datos necesarios para iniciar sesión.
export const loginSchema = z.object({
  email: z
    .string()
    .email("Introduce un correo electrónico válido."),

  password: z
    .string()
    .min(1, "La contraseña es obligatoria."),
});

// Tipos TypeScript derivados de los esquemas de validación.
export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
