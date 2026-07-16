import { describe, expect, it } from "vitest";
import {
  CreateUserSchema,
  ListUsersSchema,
  PasswordSchema,
  ResetPasswordSchema,
} from "./user.schema";

describe("PasswordSchema", () => {
  it("deve aceitar uma senha válida", () => {
    const result = PasswordSchema.safeParse("Password123!");
    expect(result.success).toBe(true);
  });

  it("deve rejeitar senha menor que 8 caracteres", () => {
    const result = PasswordSchema.safeParse("Pass1!");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A senha deve ter ao menos 8 caracteres.",
      );
    }
  });

  it("deve exigir pelo menos uma letra maiúscula", () => {
    const result = PasswordSchema.safeParse("password123!");
    expect(result.success).toBe(false);
  });

  it("deve exigir pelo menos uma letra minúscula", () => {
    const result = PasswordSchema.safeParse("PASSWORD123!");
    expect(result.success).toBe(false);
  });

  it("deve exigir pelo menos um número", () => {
    const result = PasswordSchema.safeParse("Password!");
    expect(result.success).toBe(false);
  });

  it("deve exigir pelo menos um caractere especial", () => {
    const result = PasswordSchema.safeParse("Password123");
    expect(result.success).toBe(false);
  });

  it("deve rejeitar senhas contendo espaços", () => {
    const result = PasswordSchema.safeParse("Pass word123!");
    expect(result.success).toBe(false);
  });
});

describe("CreateUserSchema", () => {
  it("deve normalizar o nome transformando para iniciais maiúsculas (capitalizeName)", () => {
    const input = {
      name: "ana de souza",
      email: "ana@example.com",
      role: "user",
    };
    const result = CreateUserSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Ana de Souza");
    }
  });

  it("deve rejeitar nome inválido", () => {
    const shortNameResult = CreateUserSchema.safeParse({
      name: "a",
      email: "ana@example.com",
      role: "user",
    });
    expect(shortNameResult.success).toBe(false);

    const invalidCharResult = CreateUserSchema.safeParse({
      name: "Ana123",
      email: "ana@example.com",
      role: "user",
    });
    expect(invalidCharResult.success).toBe(false);
  });

  it("deve rejeitar e-mail inválido", () => {
    const result = CreateUserSchema.safeParse({
      name: "Ana Silva",
      email: "email-invalido",
      role: "user",
    });
    expect(result.success).toBe(false);
  });

  it("deve aceitar criação com senha gerada automaticamente (sem senha manual)", () => {
    const input = {
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      autoGeneratePassword: true,
    };
    const result = CreateUserSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.autoGeneratePassword).toBe(true);
      expect(result.data.password).toBeUndefined();
    }
  });

  it("deve aceitar senha manual válida quando autoGeneratePassword for false", () => {
    const input = {
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      autoGeneratePassword: false,
      password: "Password123!",
    };
    const result = CreateUserSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar senha manual ausente ou inválida quando autoGeneratePassword for false", () => {
    const missingPasswordResult = CreateUserSchema.safeParse({
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      autoGeneratePassword: false,
    });
    expect(missingPasswordResult.success).toBe(false);

    const invalidPasswordResult = CreateUserSchema.safeParse({
      name: "Ana Silva",
      email: "ana@example.com",
      role: "user",
      autoGeneratePassword: false,
      password: "123",
    });
    expect(invalidPasswordResult.success).toBe(false);
  });
});

describe("ResetPasswordSchema", () => {
  it("deve aceitar quando as senhas forem iguais", () => {
    const input = {
      newPassword: "Password123!",
      confirmPassword: "Password123!",
    };
    const result = ResetPasswordSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar quando as senhas forem diferentes", () => {
    const input = {
      newPassword: "Password123!",
      confirmPassword: "DifferentPassword123!",
    };
    const result = ResetPasswordSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("As senhas não conferem.");
    }
  });
});

describe("ListUsersSchema", () => {
  it("deve aplicar os valores padrão para page (1) e pageSize (15)", () => {
    const result = ListUsersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(15);
    }
  });

  it("deve fazer a coerção de strings numéricas para números", () => {
    const input = {
      page: "2",
      pageSize: "25",
    };
    const result = ListUsersSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(25);
    }
  });

  it("deve rejeitar páginas inválidas (menores ou iguais a zero)", () => {
    expect(ListUsersSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(ListUsersSchema.safeParse({ page: -1 }).success).toBe(false);
  });

  it("deve respeitar o limite máximo de pageSize (100)", () => {
    expect(ListUsersSchema.safeParse({ pageSize: 100 }).success).toBe(true);
    expect(ListUsersSchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });

  it("deve rejeitar valores inválidos em orderBy, order e role", () => {
    expect(ListUsersSchema.safeParse({ role: "superadmin" }).success).toBe(
      false,
    );
    expect(ListUsersSchema.safeParse({ order: "up" }).success).toBe(false);
    expect(ListUsersSchema.safeParse({ orderBy: "unknown" }).success).toBe(
      false,
    );
  });
});
