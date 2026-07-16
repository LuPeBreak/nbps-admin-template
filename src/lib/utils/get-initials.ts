/**
 * Iniciais do nome (até 2), em maiúsculas. Usado em avatares fallback.
 *
 * @example getInitials("Ana Silva") // "AS"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
