import { z } from "zod";

// Estos valores acaban en href y en CSS: solo se aceptan formas seguras.
const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  href: z.url({ protocol: /^https$/ }),
});

export function parseSocialLinks(value: unknown) {
  const parsed = z.array(socialLinkSchema).max(10).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function parseBrandColor(value: unknown): string | null {
  const parsed = z.object({ primary: z.string().regex(/^#[0-9a-fA-F]{6}$/) }).safeParse(value);
  return parsed.success ? parsed.data.primary : null;
}
