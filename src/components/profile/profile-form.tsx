"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordInput } from "@/components/password-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/auth";
import { authClient } from "@/lib/auth/auth-client";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import { getInitials } from "@/lib/utils/get-initials";
import {
  type NameInput,
  NameSchema,
  type PasswordInput as PasswordFormInput,
  PasswordSchema,
} from "@/validations/profile.schema";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const redirectRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nameFormId = useId();
  const passFormId = useId();

  const nameForm = useForm<NameInput>({
    resolver: zodResolver(NameSchema),
    defaultValues: { name },
  });

  const passForm = useForm<PasswordFormInput>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onUpdateName(data: NameInput) {
    const { error } = await authClient.updateUser({ name: data.name });

    if (error) {
      toast.error(translateAuthError(error));
      return;
    }
    toast.success("Nome atualizado com sucesso.");
    router.refresh();
  }

  async function onChangePassword(data: PasswordFormInput) {
    const { error } = await authClient.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (error) {
      toast.error(translateAuthError(error));
      return;
    }
    toast.success("Senha alterada com sucesso. Redirecionando para login...");
    redirectRef.current = setTimeout(async () => {
      await signOut();
      router.push("/sign-in");
    }, 2000);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-2xl font-medium text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Conta protegida
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Alterar Nome</CardTitle>
              <CardDescription>Atualize seu nome de exibição.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={nameForm.handleSubmit(onUpdateName)}
            className="space-y-4"
          >
            <Controller
              name="name"
              control={nameForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${nameFormId}-${field.name}`}>
                    Nome
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${nameFormId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button type="submit" disabled={nameForm.formState.isSubmitting}>
              {nameForm.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Digite sua senha atual e escolha uma nova.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passForm.handleSubmit(onChangePassword)}
            className="space-y-4"
          >
            <Controller
              name="currentPassword"
              control={passForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${passFormId}-${field.name}`}>
                    Senha Atual
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id={`${passFormId}-${field.name}`}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="newPassword"
                control={passForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${passFormId}-${field.name}`}>
                      Nova Senha
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id={`${passFormId}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`${passFormId}-${field.name}`}>
                      Confirmar Nova Senha
                    </FieldLabel>
                    <PasswordInput
                      {...field}
                      id={`${passFormId}-${field.name}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Button type="submit" disabled={passForm.formState.isSubmitting}>
              {passForm.formState.isSubmitting
                ? "Alterando..."
                : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
