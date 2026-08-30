import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./auth", () => ({
  auth: {
    api: { getSession: mocks.getSession },
  },
}));

import { protectedAction, type Session } from "./protected-action";
import { requireSession } from "./require-session";

class RedirectSignal extends Error {
  constructor(readonly destination: string) {
    super(`Redirected to ${destination}`);
  }
}

function createSession(role: unknown): Session {
  return {
    session: { id: "session-1" },
    user: { id: "user-1", role },
  } as Session;
}

beforeEach(() => {
  mocks.getSession.mockReset();
  mocks.headers.mockReset();
  mocks.redirect.mockReset();

  mocks.headers.mockResolvedValue(new Headers({ cookie: "session=token" }));
  mocks.redirect.mockImplementation((destination: string) => {
    throw new RedirectSignal(destination);
  });
});

describe("protectedAction authorization contract", () => {
  it("returns UNAUTHORIZED and never calls the callback without a session", async () => {
    mocks.getSession.mockResolvedValue(null);
    const callback = vi.fn(async () => ({
      success: true as const,
      data: "unexpected",
    }));
    const action = protectedAction(
      [{ resource: "user", action: ["list"] }],
      callback,
    );

    await expect(action()).resolves.toEqual({
      success: false,
      error: {
        message: "Sessão expirada. Faça login novamente.",
        code: "UNAUTHORIZED",
      },
    });
    expect(callback).not.toHaveBeenCalled();
    expect(mocks.getSession).toHaveBeenCalledWith({
      headers: await mocks.headers.mock.results[0]?.value,
    });
  });

  it.each([
    [undefined, "Você não tem um cargo definido."],
    ["owner", "Você não tem permissão para executar esta ação."],
  ])(
    "returns FORBIDDEN and never calls the callback for role %s",
    async (role, message) => {
      mocks.getSession.mockResolvedValue(createSession(role));
      const callback = vi.fn(async () => ({
        success: true as const,
        data: "unexpected",
      }));
      const action = protectedAction(
        [{ resource: "user", action: ["list"] }],
        callback,
      );

      await expect(action()).resolves.toEqual({
        success: false,
        error: { message, code: "FORBIDDEN" },
      });
      expect(callback).not.toHaveBeenCalled();
    },
  );

  it("returns FORBIDDEN and never calls the callback for an insufficient role", async () => {
    mocks.getSession.mockResolvedValue(createSession("user"));
    const callback = vi.fn(async () => ({
      success: true as const,
      data: "unexpected",
    }));
    const action = protectedAction(
      [{ resource: "user", action: ["list"] }],
      callback,
    );

    await expect(action()).resolves.toEqual({
      success: false,
      error: {
        message: "Você não tem permissão para executar esta ação.",
        code: "FORBIDDEN",
      },
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("calls an authorized callback exactly once and preserves its result", async () => {
    const session = createSession("admin");
    const expected = {
      success: true as const,
      data: { value: "preserved" },
    };
    mocks.getSession.mockResolvedValue(session);
    const callback = vi.fn(
      async (_session: Session, _input: string) => expected,
    );
    const action = protectedAction(
      [{ resource: "user", action: ["list"] }],
      callback,
    );

    const result = await action("input");

    expect(result).toBe(expected);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(session, "input");
  });

  it("honors the intentional requireAll false option", async () => {
    const session = createSession("admin");
    mocks.getSession.mockResolvedValue(session);
    const callback = vi.fn(async () => ({
      success: true as const,
      data: "allowed",
    }));
    const action = protectedAction(
      [
        { resource: "user", action: ["list"] },
        { resource: "user", action: ["impersonate-admins"] },
      ],
      callback,
      { requireAll: false },
    );

    await expect(action()).resolves.toEqual({
      success: true,
      data: "allowed",
    });
    expect(callback).toHaveBeenCalledOnce();
  });
});

describe("requireSession authorization contract", () => {
  it("redirects to sign-in without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(requireSession()).rejects.toMatchObject({
      destination: "/sign-in",
    });
    expect(mocks.redirect).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("allows a valid session when no permission is required", async () => {
    const session = createSession("user");
    mocks.getSession.mockResolvedValue(session);

    await expect(requireSession()).resolves.toBe(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects an unauthorized role to the dashboard", async () => {
    mocks.getSession.mockResolvedValue(createSession("user"));

    await expect(
      requireSession([{ resource: "user", action: ["list"] }]),
    ).rejects.toMatchObject({ destination: "/dashboard" });
    expect(mocks.redirect).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("allows and preserves an authorized session", async () => {
    const session = createSession("admin");
    mocks.getSession.mockResolvedValue(session);

    await expect(
      requireSession([{ resource: "user", action: ["list"] }]),
    ).resolves.toBe(session);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
