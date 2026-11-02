import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(80)
  .optional()
  .catch(undefined)
  .transform((value) => value || undefined);

const optionalPrice = z.coerce.number().int().min(0).max(1_000_000_000).optional().catch(undefined);

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/** Los parámetros de la URL los controla el visitante: lo inválido se ignora, nunca rompe la página. */
export const catalogFiltersSchema = z.object({
  q: optionalText,
  categoria: optionalText,
  marca: optionalText,
  min: z.preprocess(emptyToUndefined, optionalPrice),
  max: z.preprocess(emptyToUndefined, optionalPrice),
  disponibilidad: z.enum(["available", "low_stock", "out_of_stock"]).optional().catch(undefined),
  orden: z.enum(["novedades", "precio-asc", "precio-desc"]).catch("novedades").default("novedades"),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

export function parseCatalogFilters(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const firstValues = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  return catalogFiltersSchema.parse(firstValues);
}
