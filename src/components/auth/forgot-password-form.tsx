"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import {
  type ForgotPasswordInput,
  ForgotPasswordSchema,
} from "@/validations/user.schema";
import { AuthCard } from "./auth-card";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const formId = useId();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(translateAuthError(error));
        return;
      }
      setSent(true);
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro de conexão. Tente novamente.");
    }
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      description={
        sent
          ? "Se o email existir, você receberá um link de redefinição. Verifique sua caixa de entrada."
          : "Digite seu email para receber um link de redefinição de senha."
      }
    >
      {sent ? (
        <Link
          href="/sign-in"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Voltar ao login
        </Link>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-${field.name}`}
                  type="email"
                  placeholder="voce@exemplo.com"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Enviando..." : "Enviar link"}
          </Button>
          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar ao login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
