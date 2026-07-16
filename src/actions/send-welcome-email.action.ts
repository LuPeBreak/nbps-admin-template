"use server";

import { z } from "zod";
import { env } from "@/env";
import { actionError, validateInput } from "@/lib/actions/action-helpers";
import { protectedAction } from "@/lib/auth/protected-action";
import { type SendEmailInput, sendEmail } from "@/lib/email";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome-email";
import type { ActionResponse } from "@/lib/errors";

const SendWelcomeEmailSchema = z.object({
  name: z.string().min(1),
  email: z.string().email("Email inválido."),
});

export const sendWelcomeEmailAction = protectedAction(
  [{ resource: "user", action: ["create"] }],
  async (
    _session,
    input: unknown,
  ): Promise<ActionResponse<{ messageId: string }>> => {
    const validated = validateInput(SendWelcomeEmailSchema, input);
    if (!validated.ok) return validated.error;

    try {
      const { html, text } = await renderWelcomeEmail({
        appName: env.EMAIL_FROM_NAME,
        name: validated.data.name,
        email: validated.data.email,
        loginUrl: `${env.BETTER_AUTH_URL}/sign-in`,
      });

      const sendInput: SendEmailInput = {
        to: validated.data.email,
        subject: `Bem-vindo ao ${env.EMAIL_FROM_NAME}`,
        html,
        text,
      };
      const result = await sendEmail(sendInput);

      return { success: true as const, data: { messageId: result.messageId } };
    } catch (error) {
      return actionError(error, "sendWelcomeEmailAction:");
    }
  },
);
