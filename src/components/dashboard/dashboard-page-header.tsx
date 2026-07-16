import type { ReactNode } from "react";

export interface DashboardPageHeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function DashboardPageHeader({
  title,
  subtitle,
  children,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
