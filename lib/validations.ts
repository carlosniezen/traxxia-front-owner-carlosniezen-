import { z } from "zod";

/** Norte (personal constitution) — validated on every save. */
export const norteSchema = z.object({
  proposito: z
    .string()
    .trim()
    .max(500, "El propósito no debería exceder 500 caracteres")
    .optional()
    .default(""),
  valores: z
    .array(z.string().trim().min(1).max(60))
    .max(7, "Máximo 7 valores")
    .default([]),
  vision75: z
    .string()
    .trim()
    .max(4000, "La visión es demasiado larga")
    .optional()
    .default(""),
});

export type NorteInput = z.infer<typeof norteSchema>;

/** Magic-link login. */
export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
});

export type LoginInput = z.infer<typeof loginSchema>;
