import { z } from "zod";
import { capitalizeName } from "@/lib/utils/capitalize-name";

export const SignInSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Senha obrigatória."),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const PasswordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .regex(/^\S+$/, "A senha não pode conter espaços.")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
  .regex(/\d/, "A senha deve conter pelo menos um número.")
  .regex(
    /[@$!%*?&.#\-_]/,
    "A senha deve conter pelo menos um caractere especial.",
  );

export const CreateUserSchema = z
  .object({
    name: z
      .string()
      .transform((val) => capitalizeName(val))
      .pipe(
        z
          .string()
          .min(2, "Nome deve ter ao menos 2 caracteres.")
          .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "O nome deve conter apenas letras."),
      ),
    email: z.string().email("Email inválido."),
    role: z.enum(["admin", "user"]),
    autoGeneratePassword: z.boolean().default(true),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.autoGeneratePassword) {
      const result = PasswordSchema.safeParse(data.password);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            ...issue,
            path: ["password"],
          });
        }
      }
    }
  });

export type CreateUserInput = z.input<typeof CreateUserSchema>;

export const EditUserSchema = z.object({
  name: z
    .string()
    .transform((val) => capitalizeName(val))
    .pipe(
      z
        .string()
        .min(2, "Nome deve ter ao menos 2 caracteres.")
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "O nome deve conter apenas letras."),
    ),
  role: z.enum(["admin", "user"]),
});

export type EditUserInput = z.infer<typeof EditUserSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Email inválido."),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const DeleteUserSchema = z.object({
  userId: z.string().min(1, "ID do usuário obrigatório."),
});

export type DeleteUserInput = z.infer<typeof DeleteUserSchema>;

export const ListUsersSchema = z.object({
  search: z.string().optional(),
  role: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["admin", "user"]).optional(),
  ),
  orderBy: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["name", "email", "role", "createdAt"]).optional(),
  ),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(15),
});

export type ListUsersInput = z.infer<typeof ListUsersSchema>;
