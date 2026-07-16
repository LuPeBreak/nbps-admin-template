"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth";
import { authClient } from "@/lib/auth/auth-client";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import { isCurrentUser } from "@/lib/user-helpers";

const BanUserSchema = z.object({
  reason: z.string().optional(),
});

type BanUserInput = z.infer<typeof BanUserSchema>;

interface BanUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BanUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: BanUserDialogProps) {
  const { data: session } = useSession();
  const isSelf = isCurrentUser(session, userId);

  const form = useForm<BanUserInput>({
    resolver: zodResolver(BanUserSchema),
    defaultValues: { reason: "" },
  });

  async function onSubmit(data: BanUserInput) {
    if (isSelf) {
      toast.error("Você não pode banir a sua própria conta.");
      return;
    }

    const { error: err } = await authClient.admin.banUser({
      userId,
      banReason: data.reason || undefined,
    });

    if (err) {
      toast.error(translateAuthError(err));
      return;
    }

    toast.success("Usuário banido.");
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Banir Usuário</DialogTitle>
              <DialogDescription>
                {isSelf ? (
                  <span className="font-medium text-destructive">
                    Você não pode banir a sua própria conta administrativa.
                  </span>
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {userName}
                    </span>{" "}
                    será impedido de acessar o sistema.
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {!isSelf && (
            <div className="space-y-1.5">
              <Label
                htmlFor="ban-reason"
                className="text-xs text-muted-foreground"
              >
                Motivo (opcional)
              </Label>
              <Input
                id="ban-reason"
                {...form.register("reason")}
                placeholder="Ex: Violação dos termos de uso"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSelf || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Banindo..."
                : "Confirmar Banimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
