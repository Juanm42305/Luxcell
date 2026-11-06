import { z } from "zod";
import { MAX_COLOR_LENGTH, MAX_COLORS } from "@/lib/product-labels";
import { SLUG_PATTERN } from "@/lib/slug";

/*
 * Validación en el servidor de todo lo que envía el panel. La base de datos repite los límites con
 * restricciones CHECK: estos esquemas dan mensajes claros, la base garantiza la integridad.
 */

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(max, `${label}: máximo ${max} caracteres.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((value) => value || null);

const slug = z
  .string()
  .trim()
  .min(1, "El identificador es obligatorio.")
  .max(120)
  .regex(SLUG_PATTERN, "Usa solo minúsculas, números y guiones (ej. iphone-15-128gb).");

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

/** Acepta "2.500.000", "$2,500,000" o "2500000". El signo menos se conserva para rechazarlo. */
const integerFrom = (label: string, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.replace(/[\s.,$]/g, "") : value),
    z.coerce
      .number({ message: `${label} debe ser un número.` })
      .int()
      .min(0, `${label} no puede ser negativo.`)
      .max(max, `${label} es demasiado alto.`),
  );

/** Una especificación por línea: "Pantalla: 6,1 pulgadas". */
const specs = z
  .string()
  .max(4000)
  .transform((value, context) => {
    const rows = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (rows.length > 30) {
      context.addIssue({ code: "custom", message: "Máximo 30 especificaciones." });
      return z.NEVER;
    }
    const parsed = rows.map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: (label ?? "").trim().slice(0, 60),
        value: rest.join(":").trim().slice(0, 200),
      };
    });
    if (parsed.some((row) => !row.label || !row.value)) {
      context.addIssue({
        code: "custom",
        message: "Cada línea debe tener la forma Nombre: valor.",
      });
      return z.NEVER;
    }
    return parsed;
  });

/** Un color por línea. Se quitan los repetidos sin importar mayúsculas. */
const colors = z
  .string()
  .max(2000)
  .transform((value, context) => {
    const unique = new Map<string, string>();
    for (const line of value.split("\n")) {
      const color = line.trim().replace(/\s+/g, " ");
      const key = color.toLocaleLowerCase("es");
      if (color && !unique.has(key)) unique.set(key, color);
    }
    const list = [...unique.values()];
    if (list.length > MAX_COLORS) {
      context.addIssue({ code: "custom", message: `Máximo ${MAX_COLORS} colores.` });
      return z.NEVER;
    }
    if (list.some((color) => color.length > MAX_COLOR_LENGTH)) {
      context.addIssue({
        code: "custom",
        message: `Cada color: máximo ${MAX_COLOR_LENGTH} caracteres.`,
      });
      return z.NEVER;
    }
    return list;
  });

const optionalPrice = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    integerFrom(label, 1_000_000_000)
      .optional()
      .transform((value) => value ?? null),
  );

const productFields = z.object({
  name: text(150, "El nombre"),
  slug,
  model: text(100, "El modelo"),
  brandId: z.uuid("Elige una marca."),
  categoryId: z.uuid("Elige una categoría."),
  shortDescription: text(300, "La descripción breve"),
  description: text(5000, "La descripción completa"),
  price: integerFrom("El precio", 1_000_000_000),
  lowStockThreshold: integerFrom("El umbral de pocas unidades", 1000),
  salePrice: optionalPrice("El precio en oferta"),
  condition: z.enum(["new", "display", "like_new", "refurbished"], {
    message: "Elige el estado del producto.",
  }),
  storageCapacity: optionalText(40),
  colors,
  specs,
  warrantyTerms: optionalText(2000),
  offerValidUntil: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Fecha no válida.")
    .transform((value) => value || null),
  isFeatured: checkbox,
  isActive: checkbox,
});

/** La base de datos repite la primera regla; la segunda evita una fecha sin oferta. */
function checkOffer(
  input: { price: number; salePrice: number | null; offerValidUntil: string | null },
  context: z.RefinementCtx,
) {
  if (input.salePrice !== null && input.salePrice >= input.price) {
    context.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "Debe ser menor que el precio normal.",
    });
  }
  if (input.offerValidUntil !== null && input.salePrice === null) {
    context.addIssue({
      code: "custom",
      path: ["salePrice"],
      message: "Escribe el precio en oferta o borra la fecha de fin.",
    });
  }
}

export const productSchema = productFields.superRefine(checkOffer);

export const newProductSchema = productFields
  .extend({ initialStock: integerFrom("Las existencias", 100_000) })
  .superRefine(checkOffer);

export const stockSchema = z.object({
  quantity: integerFrom("Las existencias", 100_000),
  reason: optionalText(200),
});

export const categorySchema = z.object({
  name: text(80, "El nombre"),
  slug,
  description: optionalText(500),
  displayOrder: integerFrom("El orden", 1000),
  isActive: checkbox,
});

export const brandSchema = z.object({
  name: text(80, "El nombre"),
  slug,
  isActive: checkbox,
});

export const uploadPathSchema = z
  .string()
  .regex(/^[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/, "Archivo no válido.");

export type FieldErrors = Record<string, string>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

export function formToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$")) result[key] = value;
  });
  return result;
}
