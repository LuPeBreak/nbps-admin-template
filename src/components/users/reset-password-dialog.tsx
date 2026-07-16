"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordInput } from "@/components/password-input";
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
import { authClient } from "@/lib/auth/auth-client";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import { PasswordSchema } from "@/validations/user.schema";
import type { UserColumn } from "./users-data-table-columns";

interface ResetPasswordDialogProps {
  user: UserColumn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const ResetPasswordFormSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("email"),
    password: z.string().optional(),
  }),
  z.object({
    method: z.literal("manual"),
    password: PasswordSchema,
  }),
]);

type ResetPasswordFormInput = z.infer<typeof ResetPasswordFormSchema>;

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ResetPasswordDialogProps) {
  const router = useRouter();
  const formId = useId();

  const form = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      method: "email",
      password: "",
    },
  });

  const watchedMethod = form.watch("method");

  useEffect(() => {
    if (!open) {
      form.reset({
        method: "email",
        password: "",
      });
    }
  }, [open, form.reset]);

  async function onSubmit(data: ResetPasswordFormInput) {
    if (data.method === "email") {
      const { error } = await authClient.requestPasswordReset({
        email: user.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(translateAuthError(error));
        return;
      }

      toast.success("Link de redefinição enviado.");
    } else {
      const { error } = await authClient.admin.setUserPassword({
        userId: user.id,
        newPassword: data.password || "",
      });

      if (error) {
        toast.error(translateAuthError(error));
        return;
      }

      toast.success("Senha redefinida com sucesso.");
    }

    onOpenChange(false);
    onSuccess?.();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            {watchedMethod === "email" ? (
              <>
                Enviaremos um link para{" "}
                <span className="font-medium text-foreground">{user.name}</span>{" "}
                (<span className="font-mono text-sm">{user.email}</span>)
                configurar uma nova senha. Nenhuma senha é gerada ou exposta — o
                próprio usuário define a senha no link recebido.
              </>
            ) : (
              <>
                Defina uma nova senha manualmente para{" "}
                <span className="font-medium text-foreground">{user.name}</span>{" "}
                (<span className="font-mono text-sm">{user.email}</span>). A
                senha deve respeitar os critérios mínimos de segurança.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                form.setValue("method", "email");
                form.clearErrors();
              }}
              className={`py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                watchedMethod === "email"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Link por Email
            </button>
            <button
              type="button"
              onClick={() => {
                form.setValue("method", "manual");
                form.setValue("password", "");
                form.clearErrors();
              }}
              className={`py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
                watchedMethod === "manual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Definir Manualmente
            </button>
          </div>

          {watchedMethod === "manual" && (
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${formId}-${field.name}`}>
                    Nova Senha
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id={`${formId}-${field.name}`}
                    placeholder="Mínimo 8 caracteres"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Processando..."
                : watchedMethod === "email"
                  ? "Enviar link"
                  : "Confirmar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
