import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { EMAIL_LAYOUT_WIDTH, EMAIL_TOKENS } from "../design-tokens";

interface EmailLayoutProps {
  appName: string;
  preview: string;
  // Optional: URL da logo (HTTPS). Se ausente, cai no placeholder com texto.
  logoUrl?: string;
  // Optional: ano (geralmente ano corrente). Se ausente, omitido do footer.
  year?: number;
  children: React.ReactNode;
}

export function EmailLayout({
  appName,
  preview,
  logoUrl,
  year,
  children,
}: EmailLayoutProps) {
  const fontStack =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: EMAIL_TOKENS.pageBg,
          margin: 0,
          padding: "32px 16px",
          fontFamily: fontStack,
          color: EMAIL_TOKENS.text,
        }}
      >
        <Container
          style={{
            backgroundColor: EMAIL_TOKENS.cardBg,
            borderRadius: "12px",
            border: `1px solid ${EMAIL_TOKENS.border}`,
            margin: "0 auto",
            maxWidth: `${EMAIL_LAYOUT_WIDTH}px`,
            overflow: "hidden",
          }}
        >
          <EmailHeader appName={appName} logoUrl={logoUrl} />
          <Section
            style={{
              padding: "32px 32px 8px",
              fontSize: "15px",
              lineHeight: "24px",
              color: EMAIL_TOKENS.text,
            }}
          >
            {children}
          </Section>
          <EmailFooter appName={appName} year={year} />
        </Container>
      </Body>
    </Html>
  );
}

function EmailHeader({
  appName,
  logoUrl,
}: {
  appName: string;
  logoUrl?: string;
}) {
  if (logoUrl) {
    return (
      <Section
        style={{
          padding: "20px 32px",
          borderBottom: `1px solid ${EMAIL_TOKENS.border}`,
          textAlign: "center",
        }}
      >
        <Img
          src={logoUrl}
          alt={appName}
          width={140}
          height={32}
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: "140px",
            height: "auto",
            outline: "none",
            border: "none",
            textDecoration: "none",
          }}
        />
      </Section>
    );
  }
  return (
    <Section
      style={{
        // mini-header com barra colorida 4px no topo
        backgroundColor: EMAIL_TOKENS.brand,
        padding: "14px 32px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        {appName}
      </Text>
    </Section>
  );
}

function EmailFooter({ appName, year }: { appName: string; year?: number }) {
  const yr = year ?? new Date().getFullYear();
  return (
    <Section
      style={{
        borderTop: `1px solid ${EMAIL_TOKENS.border}`,
        padding: "20px 32px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: "18px",
          color: EMAIL_TOKENS.textSubtle,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        © {yr} {appName}. Este é um email automático — não responda.
      </Text>
    </Section>
  );
}
