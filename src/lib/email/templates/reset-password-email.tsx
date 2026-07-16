import { Heading, Section, Text } from "@react-email/components";
import { createElement } from "react";
import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";
import { EMAIL_TOKENS } from "../design-tokens";
import { renderEmail } from "../render";

export interface ResetPasswordEmailProps {
  appName: string;
  name: string;
  resetUrl: string;
  logoUrl?: string;
  year?: number;
}

export function ResetPasswordEmail({
  appName,
  name,
  resetUrl,
  logoUrl,
  year,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout
      appName={appName}
      preview={`Redefinição de senha em ${appName}`}
      logoUrl={logoUrl}
      year={year}
    >
      <Heading as="h2" style={heading}>
        Olá, {name}!
      </Heading>

      <Text style={paragraph}>
        Recebemos uma solicitação para redefinir sua senha em{" "}
        <strong>{appName}</strong>. O link expira em 1 hora.
      </Text>

      <Section style={{ textAlign: "center", padding: "16px 0 24px" }}>
        <EmailButton href={resetUrl}>Redefinir senha</EmailButton>
      </Section>

      <Text style={{ ...paragraph, fontSize: "14px" }}>
        Se você não solicitou essa redefinição, ignore este email — sua senha
        não será alterada.
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

export async function renderResetPasswordEmail(props: ResetPasswordEmailProps) {
  return renderEmail(createElement(ResetPasswordEmail, props));
}
