import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { actionError, validateInput } from "./action-helpers";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("validateInput", () => {
  const SampleSchema = z.object({
    name: z.string().transform((value) => value.trim()),
    age: z.coerce.number(),
  });

  it("deve retornar sucesso com dados tipados, transformados e coergidos", () => {
    const result = validateInput(SampleSchema, {
      name: "  Alice  ",
      age: "30",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ name: "Alice", age: 30 });
    }
  });

  it("deve retornar erro de validação com código VALIDATION para entradas inválidas", () => {
    const FailSchema = z.object({
      name: z.string().min(2, "Nome muito curto."),
      age: z.number(),
    });
    const result = validateInput(FailSchema, { name: "A", age: 30 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toEqual({
        success: false,
        error: {
          message: "Nome muito curto.",
          code: "VALIDATION",
        },
      });
    }
  });

  it("deve conter a mensagem da primeira issue do Zod", () => {
    const MultiIssueSchema = z.object({
      field1: z.string().min(5, "Primeiro erro."),
      field2: z.string().min(5, "Segundo erro."),
    });
    const result = validateInput(MultiIssueSchema, {
      field1: "a",
      field2: "b",
    });
    expect(result.ok).toBe(false);
    if (!result.ok && !result.error.success) {
      expect(result.error.error.message).toBe("Primeiro erro.");
    }
  });

  it("deve usar o fallback 'Dados inválidos.' quando a issue não possuir mensagem", () => {
    const customSchema = {
      safeParse: () => ({
        success: false as const,
        error: { issues: [] as { message?: string }[] } as never,
      }),
    };
    const result = validateInput(customSchema as never, "anything");
    expect(result.ok).toBe(false);
    if (!result.ok && !result.error.success) {
      expect(result.error.error.message).toBe("Dados inválidos.");
    }
  });
});

describe("actionError", () => {
  it("deve retornar resposta segura de erro interno sem expor detalhes ou stack trace", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const rawError = new Error("Database connection failed: secret_key=12345");

    const result = actionError(rawError, "testContext:");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toEqual({
        message: "Erro interno.",
        code: "INTERNAL",
      });
      expect(result).not.toHaveProperty("stack");
      expect(result.error).not.toHaveProperty("details");
    }
    expect(JSON.stringify(result)).not.toContain("secret_key");
  });

  it("deve chamar console.error com o contexto e erro informados", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dummyError = new Error("Sample error");

    actionError(dummyError, "customContext:");

    expect(consoleSpy).toHaveBeenCalledWith("customContext:", dummyError);
  });

  it("deve usar contexto padrão 'action:' quando nenhum for fornecido", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dummyError = new Error("Sample error");

    actionError(dummyError);

    expect(consoleSpy).toHaveBeenCalledWith("action:", dummyError);
  });
});
