"use client";

import { Button } from "@/components/ui/button";

export default function DashboardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("DashboardError:", error);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-2xl font-bold">Algo deu errado</h2>
      <p className="text-muted-foreground">
        Ocorreu um erro ao carregar esta página.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
