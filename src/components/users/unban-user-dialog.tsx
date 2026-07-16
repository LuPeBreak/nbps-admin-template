"use client";

import { Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth-client";
import { useDialogAction } from "@/lib/use-dialog-action";

interface UnbanUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UnbanUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: UnbanUserDialogProps) {
  const { loading, execute } = useDialogAction({
    successMessage: "Usuário desbanido.",
    onSuccess,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await execute(async () => {
      const { error } = await authClient.admin.unbanUser({ userId });
      if (error) {
        return {
          success: false as const,
          error: {
            message: error.message ?? "",
            code:
              (error.code as import("@/lib/errors").ActionErrorCode) ??
              "INTERNAL",
          },
        };
      }
      return { success: true as const, data: null };
    });
    if (ok) onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Unlock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>Desbanir Usuário</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">{userName}</span>{" "}
                poderá acessar o sistema novamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Desbanindo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
