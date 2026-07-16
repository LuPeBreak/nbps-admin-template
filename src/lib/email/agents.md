# Email Module (src/lib/email/)

Transactional email delivery via **Nodemailer** (SMTP) + **React Email** templates.

---

## 💎 Golden Rules

- **Fallback Console Mode**: Dev → leave `SMTP_HOST` empty (logs emails to stdout as JSON). Production → populate for real SMTP.
- **Use EmailLayout**: Custom templates must wrap inside `EmailLayout`. Preserves typography, header/footer styling, responsive widths.
- **Use render*Email Helpers**: Every template exports `render<Name>Email(props)` → `{ html, text }`.
- **Validation Limitation**: Nodemailer validates syntax + domain existence (via MX). Delivery failures to invalid accounts on valid domains (bounces) monitored async via mail provider.
- **Client Messages in Portuguese (PT-BR)**: User-facing email text (subject lines, body copy, button labels) must be written in Portuguese (PT-BR) to match the application locale.

---

## 📂 File Structure

- `mailer.ts` — Nodemailer SMTP transport + `sendEmail` helper.
- `render.ts` — React Email renderer wrapper → `{ html, text }` using `@react-email/render`.
- `design-tokens.ts` — Shared color palette + padding for emails.
- `components/` — Low-level wrapper components (layout container, action buttons).
- `templates/` — Transactional email templates (e.g. `welcome-email.tsx`, `reset-password-email.tsx`).

---

## 🛠️ Implementation Patterns

### 1. Public Email Interface (`mailer.ts`)
Single unified `sendEmail` function. Caches Nodemailer transporter (`smtp` or `console` mode) + resolves `from` address:

```typescript
import { sendEmail } from "@/lib/email";

// Send email using the cached transporter (handles logging in console mode automatically)
const result = await sendEmail({
  to: "user@example.com",
  subject: "Assunto do E-mail",
  html: "<p>Conteúdo HTML</p>",
  text: "Conteúdo em texto plano",
});

// Returns Promise<{ messageId: string; transport: "console" | "smtp" }>
```

### 2. Template Helper Pattern
Each template exports React component + `render*` helper:

```typescript
import { createElement } from "react";
import { renderEmail } from "../render";

export interface WelcomeEmailProps {
  name: string;
  url: string;
}

export function WelcomeEmail({ name, url }: WelcomeEmailProps) {
  return (
    <EmailLayout>
      <Text>Olá {name}, bem-vindo!</Text>
      <EmailButton href={url}>Acessar Painel</EmailButton>
    </EmailLayout>
  );
}

export async function renderWelcomeEmail(props: WelcomeEmailProps) {
  return renderEmail(createElement(WelcomeEmail, props));
}
```

### 3. Invoking the Mailer in a Server Action
```typescript
import { renderWelcomeEmail, sendEmail } from "@/lib/email";

// Inside Server Action
const { html, text } = await renderWelcomeEmail({ name: user.name, url: loginUrl });
await sendEmail({
  to: user.email,
  subject: "Bem-vindo ao NBPS Admin Template",
  html,
  text,
});
```

---

## 💻 Environment Variables Configuration

- `SMTP_HOST` — SMTP host (e.g. `smtp.provider.com`). Empty in dev → log to stdout.
- `SMTP_PORT` — SMTP port (e.g., `587` STARTTLS, `465` SSL).
- `SMTP_USER` — SMTP auth user.
- `SMTP_PASSWORD` — SMTP password or app token.
- `EMAIL_FROM` — Sender address. Defaults `SMTP_USER` (SMTP) or `no-reply@localhost` (Console).
- `EMAIL_FROM_NAME` — Sender display name (e.g., `NBPS Admin Template`).
