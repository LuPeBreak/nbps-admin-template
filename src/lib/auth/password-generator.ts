const SPECIAL_CHARS = "!@#$%&*" as const;

/**
 * Gera uma senha aleatória no formato `First.LastDDDD!`:
 * - First: primeiro nome capitalizado
 * - Last: último sobrenome capitalizado
 * - DDDD: 4 dígitos aleatórios (CSPRNG)
 * - caractere especial aleatório do set !@#$%&* (CSPRNG, independente dos dígitos)
 *
 * Usa Web Crypto API (`globalThis.crypto.getRandomValues`) — funciona em
 * browser e em Node 20+ (server). NÃO usar `node:crypto` aqui: este helper
 * pode rodar em client components (ex.: CreateUserDialog.useEffect).
 *
 * Comprimento mínimo garantido: 8 caracteres.
 * Requisitos: ≥ 1 maiúscula, 4 dígitos, 1 caractere especial.
 *
 * @example
 * generatePassword("Ana Silva")       // "Ana.Silva8472!"
 * generatePassword("joão da silva")  // "João.Silva3029@"
 */
export function generatePassword(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    throw new Error("generatePassword: nome não pode ser vazio.");
  }
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const first = capitalize(parts[0]);
  const last = capitalize(parts[parts.length - 1]);
  const digits = String(csRandomInt(1000, 10000));
  const special = SPECIAL_CHARS[csRandomInt(0, SPECIAL_CHARS.length)];
  return `${first}.${last}${digits}${special}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// CSPRNG uniform int in [min, max) — rejection sampling evicia modular bias.
// Usa globalThis.crypto (Web Crypto) — disponível em browser e Node 20+.
function csRandomInt(min: number, max: number): number {
  const range = max - min;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % range);
  const buf = new Uint32Array(1);
  let val: number;
  do {
    globalThis.crypto.getRandomValues(buf);
    val = buf[0];
  } while (val > limit);
  return min + (val % range);
}
