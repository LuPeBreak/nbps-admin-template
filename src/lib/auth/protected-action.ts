import { headers } from "next/headers";
import type { PermissionOption } from "@/lib/auth/permissions";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/db/generated/enums";
import type { ActionResponse } from "@/lib/errors";
import { auth } from "./auth";

export type Session = typeof auth.$Infer.Session;

export interface ProtectedActionOptions {
  requireAll?: boolean;
}

/**
 * HOF que envolve Server Actions, garantindo que o usuário esteja autenticado
 * E possua as permissões requeridas. Substitui o antigo `withPermissions`.
 *
 * Custo por invocação:
 * - 1 chamada a `auth.api.getSession` (validação de sessão no DB — security
 *   boundary não removível).
 * - 0 chamadas a `auth.api.userHasPermission` — checagem de permissão roda
 *   em memória via `hasPermission` (lookup em `rolePermissions` estático).
 *
 * Veja `src/lib/auth/permissions.ts` para o trade-off do helper in-memory.
 */
export function protectedAction<T, TArgs extends unknown[]>(
  options: PermissionOption[],
  callback: (session: Session, ...args: TArgs) => Promise<ActionResponse<T>>,
  opts?: ProtectedActionOptions,
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

    const requireAll = opts?.requireAll ?? true;
    const role = session.user.role as Role;

    if (!role) {
      return {
        success: false,
        error: {
          message: "Você não tem um cargo definido.",
          code: "FORBIDDEN",
        },
      };
    }

    if (!hasPermission(role, options, requireAll)) {
      return {
        success: false,
        error: {
          message: "Você não tem permissão para executar esta ação.",
          code: "FORBIDDEN",
        },
      };
    }

    return callback(session, ...args);
  };
}
