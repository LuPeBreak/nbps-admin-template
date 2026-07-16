import { Button } from "@react-email/components";
import { EMAIL_TOKENS } from "../design-tokens";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

// Email clients (Gmail, Outlook) não resolvem Tailwind/CSS vars do Next app.
// Tudo inline. Contraste e alinhamento garantidos sem dependência externa.
export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: EMAIL_TOKENS.brand,
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 600,
        lineHeight: "20px",
        padding: "12px 24px",
        borderRadius: "8px",
        textDecoration: "none",
        display: "inline-block",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {children}
    </Button>
  );
}
