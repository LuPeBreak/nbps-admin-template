"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-provider";

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar();

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-primary/10 transition-colors"
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      />
      <div className="absolute -right-3 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm pointer-events-none">
        {collapsed ? (
          <PanelLeftOpen className="h-3 w-3" />
        ) : (
          <PanelLeftClose className="h-3 w-3" />
        )}
      </div>
    </>
  );
}
