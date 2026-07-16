import { z } from "zod";
import { capitalizeName } from "@/lib/utils/capitalize-name";

export const NameSchema = z.object({
  name: z
    .string()
    .transform((val) => capitalizeName(val))
    .pipe(
      z
        .string()
        .min(2, "Nome deve ter pelo menos 2 caracteres.")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "O nome deve conter apenas letras."),
    ),
});

export type NameInput = z.infer<typeof NameSchema>;

export const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória."),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter pelo menos 8 caracteres.")
      .regex(/^\S+$/, "A senha não pode conter espaços.")
      .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
      .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
      .regex(/\d/, "A senha deve conter pelo menos um número.")
      .regex(
        /[@$!%*?&.#\-_]/,
        "A senha deve conter pelo menos um caractere especial.",
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Senhas não conferem.",
    path: ["confirmPassword"],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"],
  });

export type PasswordInput = z.infer<typeof PasswordSchema>;
