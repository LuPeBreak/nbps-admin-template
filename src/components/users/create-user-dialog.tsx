"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendWelcomeEmailAction } from "@/actions/send-welcome-email.action";
import { PasswordInput } from "@/components/password-input";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth";
import { generatePassword } from "@/lib/auth/password-generator";
import { translateAuthError } from "@/lib/auth/translate-auth-error";
import {
  type CreateUserInput,
  CreateUserSchema,
} from "@/validations/user.schema";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const router = useRouter();
  const formId = useId();
  const [generatedPassword, setGeneratedPassword] = useState("");

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      autoGeneratePassword: true,
      password: "",
    },
  });

  const watchedAutoGeneratePassword = form.watch("autoGeneratePassword");
  const watchedName = form.watch("name");

  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        email: "",
        role: "user",
        autoGeneratePassword: true,
        password: "",
      });
    }
  }, [open, form.reset]);

  useEffect(() => {
    const trimmed = (watchedName || "").trim();
    if (!trimmed) {
      setGeneratedPassword(generatePassword("Novo Usuario"));
      return;
    }

    const handler = setTimeout(() => {
      try {
        setGeneratedPassword(generatePassword(trimmed));
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [watchedName]);

  async function onSubmit(data: CreateUserInput) {
    const passwordToUse = data.autoGeneratePassword
      ? generatedPassword
      : data.password || "";

    try {
      const { error: createError } = await authClient.admin.createUser({
        email: data.email,
        password: passwordToUse,
        name: data.name,
        role: data.role,
      });

      if (createError) {
        toast.error(translateAuthError(createError));
        return;
      }

      // Dispara o envio do email e aguarda para avisar status no toast
      const welcome = await sendWelcomeEmailAction({
        name: data.name,
        email: data.email,
      });

      if (welcome.success) {
        toast.success("Usuário criado e e-mail enviado com sucesso.");
      } else {
        toast.warning(
          `Usuário criado, mas falhou ao enviar o e-mail: ${welcome.error?.message ?? "erro desconhecido"}.`,
        );
      }

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro de conexão. Tente novamente.");
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie uma conta para o usuário. Se a senha for gerada
            automaticamente, copie-a abaixo para testes ou envio manual caso
            necessário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={`${formId}-${field.name}`}>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="py-1">
            <Controller
              control={form.control}
              name="autoGeneratePassword"
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id={`${formId}-${field.name}`}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue("password", "");
                        form.clearErrors("password");
                      }
                    }}
                  />
                  <FieldLabel
                    htmlFor={`${formId}-${field.name}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    Gerar senha automaticamente
                  </FieldLabel>
                </Field>
              )}
            />
          </div>

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={
                  !watchedAutoGeneratePassword && fieldState.invalid
                }
              >
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Senha
                </FieldLabel>
                <div className="flex gap-2">
                  {watchedAutoGeneratePassword ? (
                    <>
                      <Input
                        key="generated-password-input"
                        id={`${formId}-${field.name}`}
                        type="text"
                        value={generatedPassword}
                        readOnly
                        className="font-mono bg-muted"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              generatedPassword,
                            );
                            toast.success("Senha copiada!");
                          } catch {
                            toast.error("Copie manualmente.");
                          }
                        }}
                        aria-label="Copiar senha"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <PasswordInput
                      {...field}
                      key="manual-password-input"
                      id={`${formId}-${field.name}`}
                      placeholder="Mínimo 8 caracteres"
                      aria-invalid={fieldState.invalid}
                    />
                  )}
                </div>
                {!watchedAutoGeneratePassword && fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Criando..." : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
