/** Prepara el texto del visitante para ILIKE: sin tildes y con los comodines como texto literal. */
export function toSearchPattern(query: string): string {
  const normalized = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return `%${normalized.replace(/[\\%_]/g, "\\$&")}%`;
}
