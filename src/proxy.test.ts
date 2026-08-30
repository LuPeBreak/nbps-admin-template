import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: {
    api: { getSession: mocks.getSession },
  },
}));

import { config, proxy } from "./proxy";

function createRequest(pathname: string, cookie?: string) {
  return new NextRequest(`https://example.test${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

beforeEach(() => {
  mocks.getSession.mockReset();
});

describe("proxy authentication contract", () => {
  it.each([
    ["/dashboard", true],
    ["/dashboard/admin/users", true],
    ["/api/auth/get-session", false],
    ["/_next/static/chunks/app.js", false],
  ])("matches %s: %s", (url, expected) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(
      expected,
    );
  });

  it.each(["/dashboard", "/dashboard/admin/users"])(
    "redirects an anonymous private request for %s to sign-in",
    async (pathname) => {
      mocks.getSession.mockResolvedValue(null);

      const response = await proxy(createRequest(pathname));

      expect(getRedirectUrl(response)).toBe("https://example.test/sign-in");
    },
  );

  it("allows an authenticated private request", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });

    const response = await proxy(
      createRequest("/dashboard/admin/users", "session=token"),
    );

    expect(getRedirectUrl(response)).toBeNull();
    expect(response.status).toBe(200);
    const [{ headers }] = mocks.getSession.mock.calls[0] ?? [];
    expect(headers.get("cookie")).toBe("session=token");
  });

  it("redirects an authenticated auth-route request to the dashboard", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });

    const response = await proxy(createRequest("/sign-in"));

    expect(getRedirectUrl(response)).toBe("https://example.test/dashboard");
  });

  it.each(["/sign-in", "/forgot-password", "/reset-password"])(
    "allows an anonymous auth-route request for %s",
    async (pathname) => {
      mocks.getSession.mockResolvedValue(null);

      const response = await proxy(createRequest(pathname));

      expect(getRedirectUrl(response)).toBeNull();
      expect(response.status).toBe(200);
    },
  );

  it("allows a public request without querying the session", async () => {
    const response = await proxy(createRequest("/"));

    expect(getRedirectUrl(response)).toBeNull();
    expect(response.status).toBe(200);
    expect(mocks.getSession).not.toHaveBeenCalled();
  });
});
