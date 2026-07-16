"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-provider";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

/**
 * Client component único por link. Usa `usePathname()` pra marcar ativo
 * e `useSidebar()` pra colapsar/expandir. Mantém o resto do sidebar server.
 *
 * Active state: indicador lateral (borda esquerda) + background em todo o width.
 * Garante layout consistente independente do tamanho do texto.
 *
 * `exact`, quando `true`, considera apenas match exato (evita que `/dashboard`
 * permaneça ativo quando o usuário navega para `/dashboard/admin/users`).
 */
export function SidebarLink({
  href,
  label,
  icon,
  exact = false,
}: SidebarLinkProps & { exact?: boolean }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const linkClasses = cn(
    "relative flex h-9 w-full items-center rounded-lg text-sm font-medium transition-all overflow-hidden",
    collapsed ? "justify-center px-2 gap-0" : "px-3 gap-3",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

  return (
    <Tooltip>
      <TooltipTrigger className="block w-full">
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={linkClasses}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute inset-y-1.5 left-1 w-1 rounded-r-full bg-primary transition-all duration-200"
            />
          )}
          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
            {icon}
          </span>
          <span
            className={cn(
              "whitespace-nowrap transition-all duration-200 truncate",
              collapsed
                ? "w-0 opacity-0 pointer-events-none"
                : "w-auto opacity-100",
            )}
          >
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  );
}
