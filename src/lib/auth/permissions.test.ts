import { describe, expect, it } from "vitest";
import { hasPermission, type PermissionOption } from "./permissions";

describe("hasPermission", () => {
  it("deve permitir a role admin para permissões permitidas", () => {
    const option: PermissionOption[] = [
      { resource: "user", action: ["create"] },
    ];
    expect(hasPermission("admin", option)).toBe(true);
  });

  it("deve negar o acesso da role user ao menu administrativo", () => {
    const option: PermissionOption[] = [
      { resource: "menu", action: ["users"] },
    ];
    expect(hasPermission("user", option)).toBe(false);
  });

  it("deve validar múltiplas permissões com requireAll = true (exigir todas)", () => {
    const permissions: PermissionOption[] = [
      { resource: "user", action: ["create"] },
      { resource: "menu", action: ["users"] },
    ];
    expect(hasPermission("admin", permissions, true)).toBe(true);

    const mixedPermissions: PermissionOption[] = [
      { resource: "user", action: ["create"] },
      { resource: "menu", action: ["non_existent" as never] },
    ];
    expect(hasPermission("admin", mixedPermissions, true)).toBe(false);
  });

  it("deve validar múltiplas permissões com requireAll = false (exigir ao menos uma)", () => {
    const permissions: PermissionOption[] = [
      { resource: "user", action: ["create"] },
      { resource: "menu", action: ["non_existent" as never] },
    ];
    expect(hasPermission("admin", permissions, false)).toBe(true);

    const noAccessPermissions: PermissionOption[] = [
      { resource: "user", action: ["non_existent" as never] },
      { resource: "menu", action: ["users"] },
    ];
    expect(hasPermission("user", noAccessPermissions, false)).toBe(false);
  });

  it("deve retornar false para role ou permissão inválida", () => {
    const validOption: PermissionOption[] = [
      { resource: "user", action: ["list"] },
    ];
    expect(hasPermission("invalid_role" as never, validOption)).toBe(false);

    const invalidActionOption: PermissionOption[] = [
      { resource: "user", action: ["non_existent_action" as never] },
    ];
    expect(hasPermission("user", invalidActionOption)).toBe(false);
  });

  it("deve aceitar chamadas sem actions específicas verificando apenas o recurso no role", () => {
    const optionWithoutActions: PermissionOption[] = [{ resource: "user" }];
    expect(hasPermission("admin", optionWithoutActions)).toBe(true);
  });
});
