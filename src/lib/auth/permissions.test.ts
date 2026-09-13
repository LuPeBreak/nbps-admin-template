import { describe, expect, it } from "vitest";
import { authClient } from "./auth-client";
import {
  hasPermission,
  isRole,
  type PermissionRequest,
  type PermissionRequirement,
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

const CASES = [
  { name: "one action", request: { user: ["list"] }, allowed: true },
  {
    name: "multiple actions",
    request: { user: ["update", "set-role"] },
    allowed: true,
  },
  {
    name: "multiple resources and actions",
    request: { user: ["create", "set-role"], session: ["list", "revoke"] },
    allowed: true,
  },
  {
    name: "one denied action",
    request: { user: ["list", "impersonate-admins"] },
    allowed: false,
  },
  {
    name: "one denied resource group",
    request: { user: ["impersonate-admins"], session: ["revoke"] },
    allowed: false,
  },
] satisfies { name: string; request: PermissionRequest; allowed: boolean }[];

const OR_CASES = [
  {
    name: "first alternative grants",
    request: { anyOf: [{ user: ["list"] }, { user: ["impersonate-admins"] }] },
    allowed: true,
  },
  {
    name: "second alternative grants on the same resource",
    request: {
      anyOf: [
        { user: ["impersonate-admins"] },
        { user: ["update", "set-role"] },
      ],
    },
    allowed: true,
  },
  {
    name: "second alternative grants on another resource",
    request: {
      anyOf: [{ user: ["impersonate-admins"] }, { session: ["revoke"] }],
    },
    allowed: true,
  },
  {
    name: "preserves (A AND B) OR C when neither branch grants",
    request: {
      anyOf: [
        { user: ["list", "impersonate-admins"] },
        { user: ["impersonate-admins"] },
      ],
    },
    allowed: false,
  },
  {
    name: "preserves multi-resource AND before OR",
    request: {
      anyOf: [
        { user: ["impersonate-admins"], session: ["list"] },
        { user: ["impersonate-admins"] },
      ],
    },
    allowed: false,
  },
  {
    name: "allows C after a denied A AND B",
    request: {
      anyOf: [
        { user: ["list", "impersonate-admins"] },
        { session: ["revoke"] },
      ],
    },
    allowed: true,
  },
] satisfies {
  name: string;
  request: { anyOf: PermissionRequest[] };
  allowed: boolean;
}[];

describe("hasPermission authorization contract", () => {
  it.each(NBPS_ADMIN_USER_ACTIONS)(
    "grants admin and denies user for user:%s",
    (action) => {
      const request = { user: [action] } satisfies PermissionRequest;
      expect(hasPermission("admin", request)).toBe(true);
      expect(hasPermission("user", request)).toBe(false);
    },
  );

  it.each(CASES)("AND: $name", ({ request, allowed }) => {
    expect(hasPermission("admin", request)).toBe(allowed);
    expect(hasPermission("user", request)).toBe(false);
  });

  it.each(OR_CASES)("OR: $name", ({ request, allowed }) => {
    expect(hasPermission("admin", request)).toBe(allowed);
    expect(hasPermission("user", request)).toBe(false);
  });

  it.each([
    undefined,
    null,
    "",
    "owner",
    "admin,user",
    "user,admin",
    "toString",
    "constructor",
    "__proto__",
    ["admin"],
  ])("denies invalid single role %j", (role) => {
    expect(isRole(role)).toBe(false);
    expect(hasPermission(role, { user: ["list"] })).toBe(false);
  });

  it.each(["admin", "user"])("accepts configured role %s", (role) => {
    expect(isRole(role)).toBe(true);
  });

  // Replaces the old resource-only shortcut and empty-AND behavior explicitly.
  it.each([
    {},
    { user: [] },
    { user: undefined },
    { anyOf: [] },
    { anyOf: [{}] },
    { anyOf: [{ user: [] }] },
    { anyOf: [{}, { user: ["list"] }] },
    { anyOf: [{ user: ["list"] }, {}] },
    { anyOf: [{ user: ["list"] }], user: ["list"] },
    { anyOf: [{ anyOf: [{ user: ["list"] }] }] },
    { user: { actions: ["list", "impersonate-admins"], connector: "OR" } },
    { user: "list" },
    { user: ["unknown"] },
    { user: [null] },
    { user: Array(1) },
    { anyOf: Array(1) },
    { toString: ["list"] },
    { unknown: ["list"] },
    { menu: ["users"] },
    null,
    undefined,
    [],
    Object.assign(Object.create({ session: ["revoke"] }), { user: ["list"] }),
  ])("denies empty, unsupported or malformed requirement %j", (request) => {
    expect(hasPermission("admin", request as PermissionRequirement)).toBe(
      false,
    );
  });
});

describe("parity with the real synchronous Admin client", () => {
  it.each(CASES)("matches simple request: $name", ({ request }) => {
    for (const role of ["admin", "user"] as const) {
      const result = authClient.admin.checkRolePermission({
        role,
        permissions: request,
      });
      expect(typeof result).toBe("boolean");
      expect(hasPermission(role, request)).toBe(result);
    }
  });

  it.each(OR_CASES)("composes native calls for OR: $name", ({ request }) => {
    for (const role of ["admin", "user"] as const) {
      const result = request.anyOf.some((permissions) =>
        authClient.admin.checkRolePermission({ role, permissions }),
      );
      expect(hasPermission(role, request)).toBe(result);
    }
  });
});

// These invalid calls must remain type errors under pnpm typecheck.
function permissionTypeContract() {
  // @ts-expect-error Unknown resource.
  hasPermission("admin", { posts: ["list"] });
  // @ts-expect-error Action belongs to user, not session.
  hasPermission("admin", { session: ["set-role"] });
  // @ts-expect-error Action lists must be nonempty.
  hasPermission("admin", { user: [] });
  // @ts-expect-error Native action connectors are outside the NBPS contract.
  hasPermission("admin", { user: { actions: ["list"], connector: "OR" } });
  // @ts-expect-error anyOf cannot nest.
  hasPermission("admin", { anyOf: [{ anyOf: [{ user: ["list"] }] }] });
  // @ts-expect-error Cannot mix a simple requirement with anyOf.
  hasPermission("admin", { user: ["list"], anyOf: [{ session: ["revoke"] }] });
  // @ts-expect-error Invalid action in an OR alternative.
  hasPermission("admin", { anyOf: [{ session: ["update"] }] });
  authClient.admin.checkRolePermission({
    role: "admin",
    // @ts-expect-error No native anyOf client shape.
    permissions: { anyOf: [{ user: ["list"] }] },
  });
}
void permissionTypeContract;
