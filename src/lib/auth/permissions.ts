import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";
import type { Role } from "@/lib/db/generated/enums";

const statement = { ...defaultStatements } as const;

export const ac = createAccessControl(statement);
export const user = ac.newRole({ ...userAc.statements });
export const admin = ac.newRole({ ...adminAc.statements });

/** Shared by the server and client Admin plugins; exhaustive over Prisma roles. */
export const roles = { admin, user } satisfies Record<
  Role,
  ReturnType<typeof ac.newRole>
>;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.hasOwn(roles, value);
}

type Resource = keyof typeof statement;

/** Native simple request: AND across resources and their nonempty action lists. */
export type PermissionRequest = {
  [R in Resource]?: [
    (typeof statement)[R][number],
    ...(typeof statement)[R][number][],
  ];
};

/** NBPS composition: OR between complete AND requests, without nesting. */
export type PermissionRequirement =
  | (PermissionRequest & { anyOf?: never })
  | ({ anyOf: PermissionRequest[] } & { [R in Resource]?: never });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function isPermissionRequest(value: unknown): value is PermissionRequest {
  if (!isPlainObject(value)) return false;
  const keys = Reflect.ownKeys(value);
  return (
    keys.length > 0 &&
    keys.every((resource) => {
      if (
        typeof resource !== "string" ||
        !Object.hasOwn(statement, resource) ||
        !Object.prototype.propertyIsEnumerable.call(value, resource)
      ) {
        return false;
      }
      const actions = value[resource];
      return (
        Array.isArray(actions) &&
        actions.length > 0 &&
        Array.from(actions).every((action) => typeof action === "string")
      );
    })
  );
}

/** Capability gate only. Contextual rules such as ownership belong to the server domain. */
export function hasPermission(
  roleName: unknown,
  requirement: PermissionRequirement,
): boolean {
  if (!isRole(roleName) || !isPlainObject(requirement)) return false;
  const role = roles[roleName];

  if (Object.hasOwn(requirement, "anyOf")) {
    const alternatives = requirement.anyOf;
    return (
      Reflect.ownKeys(requirement).length === 1 &&
      Array.isArray(alternatives) &&
      alternatives.length > 0 &&
      Array.from(alternatives).every(isPermissionRequest) &&
      alternatives.some((request) => role.authorize(request).success)
    );
  }

  return (
    isPermissionRequest(requirement) && role.authorize(requirement).success
  );
}
