import { Home, type LucideIcon, Users } from "lucide-react";
import { hasPermission } from "@/lib/auth/permissions";

import type { Role } from "@/lib/db/generated/enums";

export type MenuKey = "users";

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Permission key do namespace `menu` (ver `permissions.ts`).
   * Quando omitido, o link é visível para todos os usuários autenticados.
   */
  permission?: MenuKey;
}

export const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Visão Geral", icon: Home },
  {
    href: "/dashboard/admin/users",
    label: "Usuários",
    icon: Users,
    permission: "users",
  },
];

/**
 * Checagem de permissão de menu **síncrona e em memória** (zero HTTP).
 *
 * Thin wrapper sobre `hasPermission` (helper unificado com `protectedAction`)
 * — consome o mesmo map `rolePermissions` em `permissions.ts`.
 *
 * Para adicionar cargos novos, edite `permissions.ts` e adicione a role
 * ao map `rolePermissions` — esta função não precisa mudar.
 */
export function hasMenuPermission(roleName: Role, key: MenuKey): boolean {
  return hasPermission(roleName, [{ resource: "menu", action: [key] }]);
}
