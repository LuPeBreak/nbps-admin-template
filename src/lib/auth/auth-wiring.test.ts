import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  adminClient: vi.fn((options: unknown) => ({ options })),
  betterAuth: vi.fn((options: unknown) => ({ options })),
  createAuthClient: vi.fn(() => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    useSession: vi.fn(),
  })),
  prismaAdapter: vi.fn(() => ({ adapter: "prisma" })),
  renderEmail: vi.fn(),
  sendEmail: vi.fn(),
  serverAdmin: vi.fn((options: unknown) => ({ options })),
}));

vi.mock("better-auth", () => ({ betterAuth: mocks.betterAuth }));
vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter: mocks.prismaAdapter,
}));
vi.mock("better-auth/plugins", () => ({ admin: mocks.serverAdmin }));
vi.mock("better-auth/client/plugins", () => ({
  adminClient: mocks.adminClient,
}));
vi.mock("better-auth/react", () => ({
  createAuthClient: mocks.createAuthClient,
}));
vi.mock("@/env", () => ({ env: { EMAIL_FROM_NAME: "NBPS" } }));
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/email", () => ({
  ResetPasswordEmail: () => null,
  renderEmail: mocks.renderEmail,
  sendEmail: mocks.sendEmail,
}));

import { ac, admin as adminRole, user as userRole } from "./permissions";
import "./auth";
import "./auth-client";

interface RoleWiring {
  ac?: unknown;
  roles?: {
    admin?: unknown;
    user?: unknown;
  };
}

function expectSharedRoleWiring(options: RoleWiring | undefined) {
  expect(options?.ac).toBe(ac);
  expect(options?.roles?.admin).toBe(adminRole);
  expect(options?.roles?.user).toBe(userRole);
}

describe("Better Auth role wiring contract", () => {
  it("passes the shared access control and roles to the server admin plugin", () => {
    expect(mocks.serverAdmin).toHaveBeenCalledOnce();
    const options = mocks.serverAdmin.mock.calls[0]?.[0] as
      | RoleWiring
      | undefined;

    expectSharedRoleWiring(options);
  });

  it("passes the shared access control and roles to the client admin plugin", () => {
    expect(mocks.adminClient).toHaveBeenCalledOnce();
    const options = mocks.adminClient.mock.calls[0]?.[0] as
      | RoleWiring
      | undefined;

    expectSharedRoleWiring(options);
  });
});
