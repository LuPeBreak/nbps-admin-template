import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "@/lib/auth/auth-client";
import { ac } from "@/lib/auth/permissions";
import { CreateUsersButton } from "./create-user-button";

const mocks = vi.hoisted(() => ({
  check: vi.fn<typeof authClient.admin.checkRolePermission>(),
}));

vi.mock("@/lib/auth", () => ({
  authClient: { admin: { checkRolePermission: mocks.check } },
}));
vi.mock("./create-user-dialog", () => ({ CreateUserDialog: () => null }));

beforeEach(() => {
  mocks.check.mockReset();
  mocks.check.mockImplementation((input) =>
    authClient.admin.checkRolePermission(input),
  );
});

describe("create-user capability UX", () => {
  it("renders for admin and hides for user using the real client check", () => {
    expect(
      renderToStaticMarkup(createElement(CreateUsersButton, { role: "admin" })),
    ).toContain("Novo Usuário");
    expect(
      renderToStaticMarkup(createElement(CreateUsersButton, { role: "user" })),
    ).toBe("");
  });

  it("requires set-role as well as create because the form submits a role", () => {
    // Isolated role fixtures evaluate the component's request with the native engine.
    const createOnly = ac.newRole({ user: ["create"] });
    const createWithRole = ac.newRole({ user: ["create", "set-role"] });
    mocks.check.mockImplementation(
      ({ permissions }) => createOnly.authorize(permissions).success,
    );
    expect(
      renderToStaticMarkup(createElement(CreateUsersButton, { role: "admin" })),
    ).toBe("");

    mocks.check.mockImplementation(
      ({ permissions }) => createWithRole.authorize(permissions).success,
    );
    expect(
      renderToStaticMarkup(createElement(CreateUsersButton, { role: "admin" })),
    ).toContain("Novo Usuário");
  });
});
