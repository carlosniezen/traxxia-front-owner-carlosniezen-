import { z } from "zod";
import { DIMENSIONS } from "@/lib/dimensions";

const DIMENSION_IDS = DIMENSIONS.map((d) => d.id) as [string, ...string[]];

/** A goal (universal unit) — created/edited from any horizon view. */
export const goalInputSchema = z.object({
  horizonId: z.string().uuid(),
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  dimensionIds: z
    .array(z.enum(DIMENSION_IDS))
    .max(3, "Máximo 3 dimensiones")
    .default([]),
  parentGoalId: z.string().uuid().nullable().optional(),
});

export type GoalInput = z.infer<typeof goalInputSchema>;

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
