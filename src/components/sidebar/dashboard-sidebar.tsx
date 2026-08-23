import type { Role } from "@/lib/db/generated/enums";
import { NavUser } from "./nav-user";
import { hasMenuPermission, sidebarLinks } from "./sidebar-config";
import { SidebarLink } from "./sidebar-link";
import { SidebarToggle } from "./sidebar-toggle";

interface DashboardSidebarProps {
  role: Role;
  name: string;
  email: string;
}

/**
 * Sidebar principal do dashboard. **Server Component**.
 *
 * 1. Filtra links por permissão (síncrona, em memória, zero HTTP)
 * 2. Renderiza o `<aside>` + logo + nav + user
 * 3. Delega interatividade client mínima a `SidebarLink` (1 por link)
 *    e `NavUser` (dropdown do user) — ambos pequenos
 */
export function DashboardSidebar({ role, name, email }: DashboardSidebarProps) {
  const visibleLinks = sidebarLinks.filter(
    (link) => !link.permission || hasMenuPermission(role, link.permission),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-[var(--sidebar-width)] flex-col border-r border-border/40 bg-card/70 backdrop-blur-xl transition-[width] duration-200 ease-linear motion-reduce:transition-none">
      <div className="flex h-16 items-center gap-2 overflow-hidden border-b border-border/40 px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          N
        </div>
        <span className="max-w-32 truncate text-lg font-bold tracking-tight whitespace-nowrap transition-[max-width,opacity] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsed=true]/shell:max-w-0 group-data-[collapsed=true]/shell:pointer-events-none group-data-[collapsed=true]/shell:opacity-0">
          NBPS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2">
        <ul className="flex w-full flex-col gap-1">
          {visibleLinks.map((link) => (
            <li key={link.href} className="w-full">
              <SidebarLink
                href={link.href}
                label={link.label}
                icon={<link.icon className="h-4 w-4" />}
                exact={link.href === "/dashboard"}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border/40 p-2">
        <NavUser name={name} email={email} />
      </div>

      <SidebarToggle />
    </aside>
  );
}
