import type { ZodSchema } from "zod";
import type { ActionResponse } from "@/lib/errors";

export function validateInput<T>(
  schema: ZodSchema<T>,
  input: unknown,
): { ok: true; data: T } | { ok: false; error: ActionResponse<never> } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        success: false,
        error: {
          message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
          code: "VALIDATION",
        },
      },
    };
  }
  return { ok: true, data: parsed.data };
}

export function actionError(
  error: unknown,
  context?: string,
): ActionResponse<never> {
  console.error(context ?? "action:", error);
  return {
    success: false,
    error: { message: "Erro interno.", code: "INTERNAL" },
  };
}
