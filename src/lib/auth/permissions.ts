import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";
import type { Role } from "@/lib/db/generated/enums";

const statement = {
  ...defaultStatements,
  menu: ["users"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...userAc.statements,
  menu: [],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  menu: ["users"],
});

/**
 * Mapa de role → statements (permissões) daquele cargo.
 *
 * Para adicionar um cargo novo (ex: "editor", "suporte"):
 * 1. Crie o role: `export const editor = ac.newRole({ ...userAc.statements, menu: ["users"] })`
 * 2. Adicione no map: `rolePermissions.editor = editor.statements`
 */
export const rolePermissions = {
  admin: admin.statements,
  user: user.statements,
} as const satisfies Record<Role, unknown>;

export type RoleName = Role;

/**
 * Tipagens derivadas do `statement` para type-safety em checagens.
 *
 * `Resource` = union dos resources disponíveis (ex: "user" | "session" | "menu").
 * `PermissionOption` = shape aceito por `protectedAction()` e `checkRolePermission()`.
 */
export type Resource = keyof typeof statement;

export type PermissionOption = {
  [R in Resource]: {
    resource: R;
    action?: (typeof statement)[R][number][];
  };
}[Resource];

/**
 * Checagem de permissão **síncrona e em memória** (zero HTTP, zero DB lookup).
 *
 * Espelha a semântica do `auth.api.userHasPermission` (ver
 * `node_modules/better-auth/dist/plugins/admin/has-permission.mjs`):
 * pega o `role` do usuário, consulta `rolePermissions[role]` (statements
 * estáticos do Access Control) e confere se as permissões passadas estão
 * cobertas pelo role.
 *
 * `requireAll`:
 * - `true` (default): usuário precisa ter TODAS as permissões especificadas
 * - `false`: usuário precisa ter PELO MENOS UMA
 *
 * Trade-off: este helper é **role-only** — não honra overrides per-user
 * (`adminUserIds` do Better Auth). No projeto atual, permissões são 100%
 * derivadas do role, então é semanticamente equivalente. Se um dia for
 * preciso per-user overrides, voltar para `auth.api.userHasPermission`.
 *
 * Única fonte de verdade consumida pelo `protectedAction` (server actions)
 * e pela sidebar (`hasMenuPermission` é um thin wrapper deste helper).
 */
export function hasPermission(
  roleName: Role,
  permissions: PermissionOption[],
  requireAll = true,
): boolean {
  const statements = rolePermissions[roleName];
  if (!statements) return false;

  const results = permissions.map((opt) => {
    const allowed = statements[opt.resource];
    if (!Array.isArray(allowed)) return false;
    const required = opt.action && opt.action.length > 0 ? opt.action : [];
    if (required.length === 0) {
      // Sem actions especificadas: basta ter o resource no role.
      return true;
    }
    return required.every((a) => allowed.includes(a as never));
  });

  return requireAll ? results.every(Boolean) : results.some(Boolean);
}
