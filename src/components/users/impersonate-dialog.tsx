"use client";

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

interface ImpersonateDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImpersonateDialog({
  userId,
  userName,
  open,
  onOpenChange,
}: ImpersonateDialogProps) {
  const { loading, execute } = useDialogAction({
    successMessage: `Representando ${userName}.`,
  });

  async function handleImpersonate() {
    const ok = await execute(async () => {
      const { error } = await authClient.admin.impersonateUser({ userId });
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
          <DialogTitle>Representar Usuário</DialogTitle>
          <DialogDescription>
            Você assumirá a sessão de{" "}
            <span className="font-medium text-foreground">{userName}</span>.
            Enquanto representando, você verá o sistema como este usuário. Use
            "Voltar para admin" no banner superior para retornar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="button" disabled={loading} onClick={handleImpersonate}>
            {loading ? "Entrando..." : "Representar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
