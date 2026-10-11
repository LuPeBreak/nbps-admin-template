import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  headers: vi.fn(),
  renderWelcomeEmail: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("@/env", () => ({
  env: {
    BETTER_AUTH_URL: "https://nbps.lupe.dev.br",
    EMAIL_FROM_NAME: "NBPS",
  },
}));
vi.mock("@/lib/auth/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("@/lib/email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/email/templates/welcome-email", () => ({
  renderWelcomeEmail: mocks.renderWelcomeEmail,
}));

import { sendWelcomeEmailAction } from "./send-welcome-email.action";

const input = { name: "QA", email: "qa@example.test" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ user: { id: "admin", role: "admin" } });
  mocks.headers.mockResolvedValue(new Headers({ host: "nbps.lupe.dev.br" }));
  mocks.renderWelcomeEmail.mockResolvedValue({ html: "email", text: "email" });
  mocks.sendEmail.mockResolvedValue({ messageId: "test-message" });
});

describe("welcome email request origin", () => {
  it.each(["nbps.lupe.dev.br", "41.nbps.lupe.dev.br", "205.nbps.lupe.dev.br"])(
    "uses the allowed host %s instead of forcing the canonical URL",
    async (host) => {
      mocks.headers.mockResolvedValue(new Headers({ host }));

      await expect(sendWelcomeEmailAction(input)).resolves.toMatchObject({
        success: true,
      });
      expect(mocks.renderWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({ loginUrl: `https://${host}/sign-in` }),
      );
      expect(mocks.sendEmail).toHaveBeenCalledOnce();
    },
  );

  it("uses the allowlisted forwarded host and configured HTTPS protocol", async () => {
    mocks.headers.mockResolvedValue(
      new Headers({
        host: "internal:3000",
        "x-forwarded-host": "205.nbps.lupe.dev.br",
        "x-forwarded-proto": "http",
      }),
    );

    await sendWelcomeEmailAction(input);
    expect(mocks.renderWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        loginUrl: "https://205.nbps.lupe.dev.br/sign-in",
      }),
    );
  });

  it.each(["evil.test", "nbps.lupe.dev.br.evil.test", "evilnbps.lupe.dev.br"])(
    "never uses untrusted forwarded host %s in the email",
    async (host) => {
      mocks.headers.mockResolvedValue(
        new Headers({ host: "internal:3000", "x-forwarded-host": host }),
      );
      await sendWelcomeEmailAction(input);
      expect(mocks.renderWelcomeEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          loginUrl: "https://nbps.lupe.dev.br/sign-in",
        }),
      );
    },
  );

  it("retains server-side validation and does not send invalid input", async () => {
    await expect(
      sendWelcomeEmailAction({ ...input, email: "invalid" }),
    ).resolves.toMatchObject({ success: false, error: { code: "VALIDATION" } });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("retains the create-user permission gate", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "user", role: "user" } });
    await expect(sendWelcomeEmailAction(input)).resolves.toMatchObject({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.renderWelcomeEmail).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
