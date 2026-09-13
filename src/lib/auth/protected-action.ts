import { headers } from "next/headers";
import {
  hasPermission,
  isRole,
  type PermissionRequirement,
} from "@/lib/auth/permissions";
import type { Role } from "@/lib/db/generated/enums";
import type { ActionResponse } from "@/lib/errors";
import { auth } from "./auth";

export type Session = typeof auth.$Infer.Session & { user: { role: Role } };

/**
 * Validates the session once per invocation, then evaluates static capabilities.
 * The server chooses the requirement; the callback still owns contextual rules.
 */
export function protectedAction<T, TArgs extends unknown[]>(
  requirement: PermissionRequirement,
  callback: (session: Session, ...args: TArgs) => Promise<ActionResponse<T>>,
) {
  return async (...args: TArgs): Promise<ActionResponse<T>> => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: {
          message: "Sessão expirada. Faça login novamente.",
          code: "UNAUTHORIZED",
        },
      };
    }

    if (!isRole(session.user.role)) {
      return {
        success: false,
        error: {
          message: "Você não tem um cargo definido.",
          code: "FORBIDDEN",
        },
      };
    }

    if (!hasPermission(session.user.role, requirement)) {
      return {
        success: false,
        error: {
          message: "Você não tem permissão para executar esta ação.",
          code: "FORBIDDEN",
        },
      };
    }

    // The role guard above establishes the narrowed session contract.
    return callback(session as Session, ...args);
  };
}
