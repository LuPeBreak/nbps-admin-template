import { Heading, Section, Text } from "@react-email/components";
import { createElement } from "react";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";
import { EMAIL_TOKENS } from "../design-tokens";
import { renderEmail } from "../render";

export interface WelcomeEmailProps {
  appName: string;
  name: string;
  email: string;
  loginUrl: string;
  logoUrl?: string;
  year?: number;
}

export function WelcomeEmail({
  appName,
  name,
  email,
  loginUrl,
  logoUrl,
  year,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      appName={appName}
      preview={`Bem-vindo ao ${appName}`}
      logoUrl={logoUrl}
      year={year}
    >
      <Heading as="h2" style={heading}>
        Olá, {name}!
      </Heading>

      <Text style={paragraph}>
        Sua conta no <strong>{appName}</strong> foi criada. Use seu e-mail e a
        senha informada pelo administrador para acessar a plataforma.
      </Text>

      <Text style={{ ...paragraph, fontSize: "14px" }}>
        E-mail cadastrado: <strong>{email}</strong>
      </Text>

      <Section style={{ textAlign: "center", padding: "12px 0 24px" }}>
        <EmailButton href={loginUrl}>Acessar plataforma</EmailButton>
      </Section>

      <Text
        style={{
          ...paragraph,
          fontSize: "13px",
          color: EMAIL_TOKENS.textMuted,
          marginBottom: 0,
        }}
      >
        Se você não reconhece este cadastro, entre em contato com o suporte
        imediatamente.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  margin: "0 0 16px",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "30px",
  color: EMAIL_TOKENS.text,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const paragraph = {
  margin: "0 0 16px",
  fontSize: "15px",
  lineHeight: "24px",
  color: EMAIL_TOKENS.text,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export async function renderWelcomeEmail(props: WelcomeEmailProps) {
  return renderEmail(createElement(WelcomeEmail, props));
}
