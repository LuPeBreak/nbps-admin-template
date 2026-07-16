import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(8),

    // Email — SMTP_HOST preenchido => smtp; vazio => console (dev local).
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.email().optional(),
    EMAIL_FROM_NAME: z.string().default("NBPS Admin Template"),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
