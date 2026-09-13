import { describe, expect, it } from "vitest";
import {
  ac,
  admin,
  hasPermission,
  type PermissionOption,
  type RoleName,
  user,
} from "./permissions";

const NBPS_ADMIN_USER_ACTIONS = [
  "create",
  "list",
  "update",
  "set-role",
  "set-password",
  "impersonate",
  "ban",
  "delete",
] as const;

const USER_LIST_PERMISSION = [
  { resource: "user", action: ["list"] },
] satisfies PermissionOption[];

const MENU_USERS_PERMISSION = [
  { resource: "menu", action: ["users"] },
] satisfies PermissionOption[];

const MIXED_ADMIN_PERMISSIONS = [
  { resource: "user", action: ["list"] },
  { resource: "user", action: ["impersonate-admins"] },
] satisfies PermissionOption[];

describe("hasPermission authorization contract", () => {
  it.each(NBPS_ADMIN_USER_ACTIONS)(
    "grants admin and denies user for user:%s",
    (action) => {
      const permission = [
        { resource: "user", action: [action] },
      ] satisfies PermissionOption[];

      expect(hasPermission("admin", permission)).toBe(true);
      expect(hasPermission("user", permission)).toBe(false);
    },
  );

  it("keeps menu:users and user:list as distinct permission checks", () => {
    expect(hasPermission("admin", MENU_USERS_PERMISSION)).toBe(true);
    expect(hasPermission("user", MENU_USERS_PERMISSION)).toBe(false);

    expect(hasPermission("admin", USER_LIST_PERMISSION)).toBe(true);
    expect(hasPermission("user", USER_LIST_PERMISSION)).toBe(false);

    const menuOnlyRole = ac.newRole({
      ...user.statements,
      menu: ["users"],
    });
    const listOnlyRole = ac.newRole({
      ...user.statements,
      user: ["list"],
    });

    expect(menuOnlyRole.authorize({ menu: ["users"] }).success).toBe(true);
    expect(menuOnlyRole.authorize({ user: ["list"] }).success).toBe(false);
    expect(listOnlyRole.authorize({ user: ["list"] }).success).toBe(true);
    expect(listOnlyRole.authorize({ menu: ["users"] }).success).toBe(false);
  });

  it("requires every permission by default and when requireAll is true", () => {
    expect(hasPermission("admin", MIXED_ADMIN_PERMISSIONS)).toBe(false);
    expect(hasPermission("admin", MIXED_ADMIN_PERMISSIONS, true)).toBe(false);
  });

  it("allows all granted permissions by default and when requireAll is true", () => {
    const permissions = [...USER_LIST_PERMISSION, ...MENU_USERS_PERMISSION];

    expect(hasPermission("admin", permissions)).toBe(true);
    expect(hasPermission("admin", permissions, true)).toBe(true);
  });

  it("allows any matching permission when requireAll is false", () => {
    expect(hasPermission("admin", MIXED_ADMIN_PERMISSIONS, false)).toBe(true);
  });

  it("denies when no permission matches and requireAll is false", () => {
    expect(
      hasPermission(
        "user",
        [...USER_LIST_PERMISSION, ...MENU_USERS_PERMISSION],
        false,
      ),
    ).toBe(false);
  });

  it("denies an unknown role", () => {
    const unknownRole = "auditor" as unknown as RoleName;

    expect(hasPermission(unknownRole, USER_LIST_PERMISSION)).toBe(false);
  });

  it("characterizes the local resource-only shortcut against Better Auth", () => {
    const resourceOnlyPermission = [
      { resource: "user" },
    ] satisfies PermissionOption[];

    expect(hasPermission("admin", resourceOnlyPermission)).toBe(true);
    expect(hasPermission("user", resourceOnlyPermission)).toBe(true);

    expect(admin.authorize({ user: [] }).success).toBe(false);
    expect(user.authorize({ user: [] }).success).toBe(false);
  });
});
