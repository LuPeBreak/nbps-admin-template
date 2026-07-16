"use client";

import type { ReactNode } from "react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className="flex min-h-screen bg-background group/shell"
      data-collapsed={collapsed}
      style={
        {
          "--sidebar-width": collapsed ? "3.5rem" : "14rem",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
