"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { authClient } from "@/lib/auth/auth-client";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import {
  type ResetPasswordInput,
  ResetPasswordSchema,
} from "@/validations/user.schema";
import { AuthCard } from "./auth-card";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const formId = useId();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    if (!token) {
      toast.error("Token de redefinição inválido ou expirado.");
      return;
    }
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });
      if (error) {
        toast.error(translateAuthError(error));
        return;
      }
      toast.success("Senha redefinida com sucesso.");
      router.push("/sign-in");
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro de conexão. Tente novamente.");
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Link inválido"
        description="O link de redefinição é inválido ou expirou. Solicite um novo."
      >
        <Link
          href="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Solicitar novo link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta."
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Nova senha
              </FieldLabel>
              <PasswordInput
                {...field}
                id={`${formId}-${field.name}`}
                placeholder="Mínimo 8 caracteres"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Confirmar senha
              </FieldLabel>
              <PasswordInput
                {...field}
                id={`${formId}-${field.name}`}
                placeholder="Repita a senha"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Carregando...
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
