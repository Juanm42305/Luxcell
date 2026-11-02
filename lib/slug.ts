export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** "iPhone 15 Pro (128 GB)" -> "iphone-15-pro-128-gb" */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
