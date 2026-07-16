import type { ReactNode } from "react";
import { PageBackground } from "@/components/page-background";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  withBackground?: boolean;
}

export function AuthCard({
  title,
  description,
  children,
  withBackground = true,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {withBackground && <PageBackground />}

      <div className="fixed top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      <Card className="relative w-full max-w-sm border-border/40 bg-card/80 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
