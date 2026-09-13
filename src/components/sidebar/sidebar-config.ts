import { Home, type LucideIcon, Users } from "lucide-react";
import type { PermissionRequirement } from "@/lib/auth/permissions";

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Capability required by the destination, evaluated against the session role.
   * Omit to show the link to every authenticated user.
   */
  permission?: PermissionRequirement;
}

export const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Visão Geral", icon: Home },
  {
    href: "/dashboard/admin/users",
    label: "Usuários",
    icon: Users,
    permission: { user: ["list"] },
  },
];
