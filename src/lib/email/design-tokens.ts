// Tokens de design email-only (não compõem com o globals.css do Next — email
// clients ignoram CSS vars do app). Manter centralizado para ajuste único.
const PRIMARY = "#2563eb" as const; // azul corporativo
const PRIMARY_HOVER = "#1d4ed8" as const;
const TEXT = "#0f172a" as const; // slate-900
const TEXT_MUTED = "#64748b" as const; // slate-500
const TEXT_SUBTLE = "#94a3b8" as const; // slate-400
const BORDER = "#e2e8f0" as const; // slate-200
const BG_PAGE = "#f1f5f9" as const; // slate-100
const BG_SOFT = "#f8fafc" as const; // slate-50
const BG_CODE = "#f1f5f9" as const; // slate-100 (monospace pills)

export const EMAIL_TOKENS = {
  brand: PRIMARY,
  brandHover: PRIMARY_HOVER,
  text: TEXT,
  textMuted: TEXT_MUTED,
  textSubtle: TEXT_SUBTLE,
  border: BORDER,
  pageBg: BG_PAGE,
  cardBg: "#ffffff",
  softBg: BG_SOFT,
  codeBg: BG_CODE,
} as const;

export const EMAIL_LAYOUT_WIDTH = 600 as const;
