"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth";
import { authClient } from "@/lib/auth/auth-client";
import type { ActionErrorCode } from "@/lib/errors";
import { useDialogAction } from "@/lib/use-dialog-action";
import { isCurrentUser } from "@/lib/user-helpers";
import { type EditUserInput, EditUserSchema } from "@/validations/user.schema";
import type { UserTableRow } from "./users-table-types";

interface EditUserDialogProps {
  user: UserTableRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const router = useRouter();
  const { execute } = useDialogAction({
    successMessage: "Usuário atualizado.",
    onSuccess,
  });
  const { data: session } = useSession();
  const isSelf = isCurrentUser(session, user.id);
  const formId = useId();

  const currentRole = user.role;
  const form = useForm<EditUserInput>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: { name: user.name, role: currentRole },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: A different user with identical values must also discard the previous draft.
  useEffect(() => {
    if (open) {
      form.reset({ name: user.name, role: currentRole });
    }
  }, [open, user.id, user.name, currentRole, form.reset]);

  async function onSubmit(data: EditUserInput) {
    let persisted = false;
    const ok = await execute(async () => {
      if (data.name !== user.name) {
        const { error: nameErr } = await authClient.admin.updateUser({
          userId: user.id,
          data: { name: data.name },
        });
        if (nameErr) {
          return {
            success: false as const,
            error: {
              message: nameErr.message ?? "",
              code: (nameErr.code as ActionErrorCode) ?? "INTERNAL",
            },
          };
        }
        persisted = true;
      }

      if (data.role !== currentRole) {
        const { error: roleErr } = await authClient.admin.setRole({
          userId: user.id,
          role: data.role,
        });
        if (roleErr) {
          return {
            success: false as const,
            error: {
              message: roleErr.message ?? "",
              code: (roleErr.code as ActionErrorCode) ?? "INTERNAL",
            },
          };
        }
      }

      return { success: true as const, data: null };
    });
    if (ok) {
      onOpenChange(false);
    } else if (persisted) {
      // Native name and role mutations are independent; a failed role cannot undo the name.
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados de{" "}
            <span className="font-medium text-foreground">{user.name}</span>. O
            email não pode ser alterado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Email is static/read-only and not part of the RHF form submission */}
          <Field className="opacity-60">
            <FieldLabel htmlFor={`${formId}-edit-email`}>Email</FieldLabel>
            <Input id={`${formId}-edit-email`} value={user.email} disabled />
          </Field>

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Nome
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-${field.name}`}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Cargo
                </FieldLabel>
                <Select
                  disabled={isSelf}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id={`${formId}-${field.name}`}>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {isSelf && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Você não pode alterar seu próprio cargo administrativo.
                  </p>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
