import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { env } from "@/env";
import { prisma } from "@/lib/db";
import { ResetPasswordEmail, renderEmail, sendEmail } from "@/lib/email";
import { ac, admin as adminRole, user as userRole } from "./permissions";

const APP_NAME = env.EMAIL_FROM_NAME;

export const auth = betterAuth({
  advanced: {
    ipAddress: {
      // Cloudflare IP ranges — https://www.cloudflare.com/ips/
      trustedProxies: [
        // IPv4
        "173.245.48.0/20",
        "103.21.244.0/22",
        "103.22.200.0/22",
        "103.31.4.0/22",
        "141.101.64.0/18",
        "108.162.192.0/18",
        "190.93.240.0/20",
        "188.114.96.0/20",
        "197.234.240.0/22",
        "198.41.128.0/17",
        "162.158.0.0/15",
        "104.16.0.0/13",
        "104.24.0.0/14",
        "172.64.0.0/13",
        "131.0.72.0/22",
        // IPv6
        "2400:cb00::/32",
        "2606:4700::/32",
        "2803:f800::/32",
        "2405:b500::/32",
        "2405:8100::/32",
        "2a06:98c0::/29",
        "2c0f:f248::/32",
      ],
    },
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { html, text } = await renderEmail(
        <ResetPasswordEmail
          appName={APP_NAME}
          name={user.name}
          resetUrl={url}
        />,
      );
      await sendEmail({
        to: user.email,
        subject: `Redefinição de senha · ${APP_NAME}`,
        html,
        text,
      });
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    rules: {
      signIn: { window: 60, max: 5 },
      "sign-up": { window: 60, max: 5 },
      "reset-password": { window: 60, max: 3 },
      "request-password-reset": { window: 60, max: 3 },
    },
  },
  plugins: [
    admin({
      ac,
      roles: { admin: adminRole, user: userRole },
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
});
