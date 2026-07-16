/**
 * Capitaliza as partes de um nome completo, mantendo preposições comuns em minúsculo.
 *
 * @example
 * capitalizeName("ana de souza") // "Ana de Souza"
 * capitalizeName("MARIA DA SILVA DOS SANTOS") // "Maria da Silva dos Santos"
 */
export function capitalizeName(name: string): string {
  const prepositions = ["de", "da", "do", "dos", "das", "e"];
  const trimmed = name.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      // Capitaliza se for a primeira palavra, ou se não for uma preposição
      if (index === 0 || !prepositions.includes(lower)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return lower;
    })
    .join(" ");
}
