export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Quita guiones al inicio y al final sin expresiones regulares (tiempo lineal). */
function trimDashes(text: string): string {
  let start = 0;
  let end = text.length;
  while (start < end && text[start] === "-") start++;
  while (end > start && text[end - 1] === "-") end--;
  return text.slice(start, end);
}

/** "iPhone 15 Pro (128 GB)" -> "iphone-15-pro-128-gb" */
export function toSlug(text: string): string {
  const dashed = text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return trimDashes(trimDashes(dashed).slice(0, 120));
}
