import { z } from "zod";

export const emailSchema = z.email("Escribe un correo válido.").max(254);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Escribe tu contraseña.").max(200),
});

export const newPasswordSchema = z
  .string()
  .min(12, "Usa al menos 12 caracteres.")
  .max(200)
  .regex(/[a-z]/, "Incluye una letra minúscula.")
  .regex(/[A-Z]/, "Incluye una letra mayúscula.")
  .regex(/[0-9]/, "Incluye un número.");

export const totpCodeSchema = z.string().regex(/^\d{6}$/, "El código tiene 6 dígitos.");
