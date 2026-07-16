"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import { type SignInInput, SignInSchema } from "@/validations/user.schema";
import { AuthCard } from "./auth-card";

export function SignInForm() {
  const router = useRouter();
  const formId = useId();
  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInInput) {
    const result = await signIn.email(data);
    if (result.error) {
      toast.error(translateAuthError(result.error));
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Entre com suas credenciais para continuar"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>Email</FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                type="email"
                placeholder="voce@exemplo.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>Senha</FieldLabel>
              <PasswordInput
                {...field}
                id={`${formId}-${field.name}`}
                placeholder="••••••••"
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
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
