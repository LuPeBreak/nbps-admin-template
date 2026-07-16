"use server";

import { headers } from "next/headers";
import { actionError, validateInput } from "@/lib/actions/action-helpers";
import { auth } from "@/lib/auth/auth";
import { protectedAction } from "@/lib/auth/protected-action";
import { prisma } from "@/lib/db";
import type { ActionResponse } from "@/lib/errors";
import { DeleteUserSchema } from "@/validations/user.schema";

export const deleteUserAction = protectedAction(
  [{ resource: "user", action: ["delete"] }],
  async (session, input: unknown): Promise<ActionResponse<{ ok: true }>> => {
    const validated = validateInput(DeleteUserSchema, input);
    if (!validated.ok) return validated.error;

    if (session.user.id === validated.data.userId) {
      return {
        success: false,
        error: {
          message: "Você não pode excluir a própria conta.",
          code: "FORBIDDEN",
        },
      };
    }

    try {
      const target = await prisma.user.findUnique({
        where: { id: validated.data.userId },
        select: { id: true, role: true },
      });
      if (!target) {
        return {
          success: false,
          error: { message: "Usuário não encontrado.", code: "NOT_FOUND" },
        };
      }

      if (target.role === "admin") {
        return {
          success: false,
          error: {
            message: "Contas administrativas não podem ser excluídas.",
            code: "FORBIDDEN",
          },
        };
      }

      const result = await auth.api.removeUser({
        body: { userId: validated.data.userId },
        headers: await headers(),
      });
      if (!result?.success) {
        console.error("deleteUserAction: removeUser failed");
        return {
          success: false,
          error: { message: "Falha ao excluir usuário.", code: "INTERNAL" },
        };
      }

      return { success: true as const, data: { ok: true } };
    } catch (error) {
      return actionError(error, "deleteUserAction:");
    }
  },
);
