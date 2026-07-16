import { describe, expect, it } from "vitest";
import { isCurrentUser } from "./user-helpers";

describe("isCurrentUser", () => {
  it("deve retornar true quando o id do usuário na sessão for igual ao userId informado", () => {
    const session = { user: { id: "user-123" } };
    expect(isCurrentUser(session, "user-123")).toBe(true);
  });

  it("deve retornar false quando o id do usuário na sessão for diferente do userId informado", () => {
    const session = { user: { id: "user-123" } };
    expect(isCurrentUser(session, "user-456")).toBe(false);
  });

  it("deve retornar false se a sessão for nula ou indefinda", () => {
    expect(isCurrentUser(null, "user-123")).toBe(false);
    expect(isCurrentUser(undefined, "user-123")).toBe(false);
  });

  it("deve retornar false se session.user for indefindo ou não possuir id", () => {
    expect(isCurrentUser({}, "user-123")).toBe(false);
    expect(isCurrentUser({ user: {} }, "user-123")).toBe(false);
  });
});
