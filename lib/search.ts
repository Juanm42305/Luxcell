/** Patrón ILIKE que compara el texto exacto, sin distinguir mayúsculas ni tratar % o _ como comodín. */
export function toExactPattern(text: string): string {
  return text.replace(/[\\%_]/g, "\\$&");
}

/** Prepara el texto del visitante para ILIKE: sin tildes y con los comodines como texto literal. */
export function toSearchPattern(query: string): string {
  const normalized = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return `%${normalized.replace(/[\\%_]/g, "\\$&")}%`;
}
