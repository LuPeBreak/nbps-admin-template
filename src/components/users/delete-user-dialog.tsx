"use client";

import { useState } from "react";
import { deleteUserAction } from "@/actions/delete-user.action";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useDialogAction } from "@/lib/use-dialog-action";

interface DeleteUserDialogProps {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const { loading, execute } = useDialogAction({
    successMessage: "Usuário excluído.",
    onSuccess,
  });

  async function handleDelete() {
    const ok = await execute(() => deleteUserAction({ userId }));
    if (ok) {
      onOpenChange(false);
      setConfirmed(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{userName}</span>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="delete-confirm"
            checked={confirmed}
            onCheckedChange={(c) => setConfirmed(!!c)}
          />
          <Label htmlFor="delete-confirm" className="cursor-pointer text-sm">
            Entendo que esta ação não pode ser desfeita
          </Label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!confirmed || loading}
            onClick={handleDelete}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
