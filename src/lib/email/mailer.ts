import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/env";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  messageId: string;
  transport: "console" | "smtp";
}

let cached: Transporter | null = null;
let cachedKind: "console" | "smtp" | null = null;

/**
 * Resolve o `from` do envelope:
 * - `EMAIL_FROM` explicit (precedência)
 * - em modo `smtp`: fallback p/ `SMTP_USER` (provider costuma aceitar)
 * - caso contrário (console/smtp sem user): `no-reply@localhost`
 *
 * Em `console` mode, o `from` só aparece no JSON logado — sem valor operacional.
 */
function resolveFrom(): string {
  if (env.EMAIL_FROM) return env.EMAIL_FROM;
  if (env.SMTP_HOST && env.SMTP_USER) return env.SMTP_USER;
  return "no-reply@localhost";
}

function getTransport(): {
  transporter: Transporter;
  kind: "console" | "smtp";
} {
  // Switch implícito: SMTP_HOST preenchido => smtp; ausente => console (dev).
  const kind = env.SMTP_HOST ? "smtp" : "console";

  if (cached && cachedKind === kind) {
    return { transporter: cached, kind };
  }

  if (kind === "console") {
    // JSON transport — captures the message instead of sending.
    cached = nodemailer.createTransport({
      jsonTransport: true,
    });
  } else {
    // smtp mode (SMTP_HOST preenchido) — exige também SMTP_PORT.
    if (!env.SMTP_PORT) {
      throw new Error(
        "emails: SMTP_HOST preenchido exige SMTP_PORT. Limpe SMTP_HOST para usar console (dev).",
      );
    }
    if (env.SMTP_USER && !env.SMTP_PASSWORD) {
      throw new Error("emails: SMTP_USER definido exige SMTP_PASSWORD.");
    }
    // `secure` omitido: nodemailer auto-deriva (true quando port === 465,
    // false caso contrário). Veja node_modules/nodemailer/lib/smtp-connection/index.js
    // (ême port defaults: 587 sem SSL / 465 com SSL).
    cached = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD ?? "" }
        : undefined,
    });
  }
  cachedKind = kind;
  return { transporter: cached, kind };
}

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const { transporter, kind } = getTransport();
  const info = await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME}" <${resolveFrom()}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  if (kind === "console" && process.env.NODE_ENV !== "production") {
    // Registra somente metadados: o corpo pode conter links ou outros segredos.
    // eslint-disable-next-line no-console
    console.log(
      "[email:console]",
      JSON.stringify(
        {
          to: input.to,
          subject: input.subject,
          messageId: info.messageId,
        },
        null,
        2,
      ),
    );
  }

  return {
    messageId: info.messageId,
    transport: kind,
  };
}
