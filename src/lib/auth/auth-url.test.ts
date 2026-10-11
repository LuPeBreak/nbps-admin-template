import { betterAuth, resolveDynamicBaseURL } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { admin } from "better-auth/plugins";
import { describe, expect, it } from "vitest";
import { authTrustedProxyHeaders, createAuthBaseURL } from "./auth-url";
import { ac, roles } from "./permissions";

const canonicalURL = "https://nbps.lupe.dev.br";
const email = "auth-url@example.test";
const password = "Test-only-password-123!";

async function createFixture(baseURL = canonicalURL) {
  const sentURLs: string[] = [];
  const auth = betterAuth({
    baseURL: createAuthBaseURL(baseURL),
    secret: "auth-url-integration-test-secret-at-least-32-characters",
    database: memoryAdapter({
      user: [],
      account: [],
      session: [],
      verification: [],
    }),
    advanced: { trustedProxyHeaders: authTrustedProxyHeaders },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ url }) => {
        sentURLs.push(url);
      },
    },
    plugins: [admin({ ac, roles, defaultRole: "user", adminRoles: ["admin"] })],
  });
  const created = await auth.api.createUser({
    body: { email, password, name: "Test user", role: "admin" },
  });
  return { auth, sentURLs, created };
}

function requestHeaders(host: string) {
  return new Headers({
    host: "internal-proxy:3000",
    "x-forwarded-host": host,
    "x-forwarded-proto": "https",
  });
}

describe("native Better Auth URL integration", () => {
  it.each([
    "nbps.lupe.dev.br.evil.test",
    "41.nbps.lupe.dev.br.evil.test",
    "evilnbps.lupe.dev.br",
    "41.lupe.dev.br",
    "41.nbps.lupe.dev.br:444",
  ])("does not resolve a lookalike host: %s", (host) => {
    expect(
      resolveDynamicBaseURL(
        createAuthBaseURL(canonicalURL),
        requestHeaders(host),
        "",
        authTrustedProxyHeaders,
      ),
    ).toBe(canonicalURL);
  });

  it.each(["nbps.lupe.dev.br", "41.nbps.lupe.dev.br", "205.nbps.lupe.dev.br"])(
    "keeps reset email and callback on %s",
    async (host) => {
      const { auth, sentURLs } = await createFixture();
      await auth.api.requestPasswordReset({
        headers: requestHeaders(host),
        body: { email, redirectTo: "/reset-password" },
      });
      expect(sentURLs).toHaveLength(1);
      const resetURL = new URL(sentURLs[0]);
      expect(resetURL.origin).toBe(`https://${host}`);
      expect(resetURL.pathname).toMatch(/^\/api\/auth\/reset-password\/.+/);
      expect(resetURL.searchParams.get("callbackURL")).toBe("/reset-password");

      const response = await auth.handler(
        new Request(resetURL, { headers: requestHeaders(host) }),
      );
      expect(response.status).toBe(302);
      const redirectURL = new URL(response.headers.get("location") ?? "");
      expect(redirectURL.origin).toBe(`https://${host}`);
      expect(redirectURL.pathname).toBe("/reset-password");
      expect(redirectURL.searchParams.get("token")).toBeTruthy();
    },
  );

  it("falls back to canonical for a malicious forwarded host", async () => {
    const { auth, sentURLs } = await createFixture();
    await auth.api.requestPasswordReset({
      headers: requestHeaders("nbps.lupe.dev.br.evil.test"),
      body: { email, redirectTo: "/reset-password" },
    });
    expect(sentURLs).toHaveLength(1);
    expect(new URL(sentURLs[0]).origin).toBe(canonicalURL);
  });

  it("keeps local reset links on the configured HTTP origin", async () => {
    const { auth, sentURLs } = await createFixture("http://localhost:3000");
    await auth.api.requestPasswordReset({
      headers: new Headers({ host: "localhost:3000" }),
      body: { email, redirectTo: "/reset-password" },
    });
    expect(new URL(sentURLs[0]).origin).toBe("http://localhost:3000");
  });

  it("trusts HTTPS previews without trusting foreign or HTTP deployment origins", async () => {
    const { auth } = await createFixture();
    const context = await auth.$context;
    expect(context.isTrustedOrigin(canonicalURL)).toBe(true);
    expect(context.isTrustedOrigin("https://41.nbps.lupe.dev.br")).toBe(true);
    for (const origin of [
      "https://evil.test",
      "https://nbps.lupe.dev.br.evil.test",
      "https://preview.lupe.dev.br",
      "http://nbps.lupe.dev.br",
      "http://preview-one.nbps.lupe.dev.br",
    ]) {
      expect(context.isTrustedOrigin(origin), origin).toBe(false);
    }
  });

  it("preserves headerless admin creation and secure host-only session cookies", async () => {
    const { auth, created, sentURLs } = await createFixture();
    expect(created.user.role).toBe("admin");
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
    });
    expect(new URL(sentURLs[0]).origin).toBe(canonicalURL);

    const response = await auth.api.signInEmail({
      headers: requestHeaders("41.nbps.lupe.dev.br"),
      body: { email, password },
      asResponse: true,
    });
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("session_token=");
    expect(cookie).toMatch(/; Secure/i);
    expect(cookie).toMatch(/; HttpOnly/i);
    expect(cookie).not.toMatch(/; Domain=/i);
  });
});
