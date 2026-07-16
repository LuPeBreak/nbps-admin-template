"use client";

import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!session?.session?.impersonatedBy) return null;

  async function handleStop() {
    await authClient.admin.stopImpersonating();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <output
      aria-live="polite"
      className={cn(
        "sticky top-0 z-30 flex h-10 items-center justify-between gap-3 border-b border-warning/30",
        "bg-warning px-4 text-sm font-medium text-warning-foreground shadow-sm",
        "animate-in slide-in-from-top-2 fade-in duration-300",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Shield className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">
          Você está representando{" "}
          <strong className="font-semibold">{session.user.name}</strong>
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleStop}
        disabled={isPending}
        className="h-7 shrink-0 rounded-md border border-warning-foreground/40 px-3 text-xs font-semibold text-warning-foreground hover:bg-warning-foreground/10 hover:text-warning-foreground"
      >
        {isPending ? "Saindo..." : "Voltar para admin"}
      </Button>
    </output>
  );
}
