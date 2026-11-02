import { z } from "zod";
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

export const productSchema = z.object({
  name: text(150, "El nombre"),
  slug,
  model: text(100, "El modelo"),
  brandId: z.uuid("Elige una marca."),
  categoryId: z.uuid("Elige una categoría."),
  shortDescription: text(300, "La descripción breve"),
  description: text(5000, "La descripción completa"),
  price: integerFrom("El precio", 1_000_000_000),
  lowStockThreshold: integerFrom("El umbral de pocas unidades", 1000),
  condition: z.enum(["new", "used", "refurbished"], { message: "Elige el estado del producto." }),
  storageCapacity: optionalText(40),
  color: optionalText(60),
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

export const newProductSchema = productSchema.extend({
  initialStock: integerFrom("Las existencias", 100_000),
});

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

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine((value) => value === "" || z.email().safeParse(value).success, "Correo no válido.")
  .transform((value) => value || null);

/** Una red por línea: "Instagram | https://www.instagram.com/usuario/". */
const socialLinks = z
  .string()
  .max(2000)
  .transform((value, context) => {
    const rows = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((part) => part.trim());
        return { label: label ?? "", href: href ?? "" };
      });
    const valid = z
      .array(
        z.object({
          label: z.string().min(1).max(40),
          href: z.url({ protocol: /^https$/ }),
        }),
      )
      .max(10)
      .safeParse(rows);
    if (!valid.success) {
      context.addIssue({
        code: "custom",
        message: "Cada línea debe ser Nombre | https://… (solo enlaces https).",
      });
      return z.NEVER;
    }
    return valid.data;
  });

export const settingsSchema = z.object({
  businessName: text(120, "El nombre comercial"),
  slogan: optionalText(160),
  description: optionalText(1000),
  whatsappNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[1-9][0-9]{7,14}$/.test(value),
      "Solo dígitos con indicativo, sin + ni espacios (ej. 573001234567).",
    )
    .transform((value) => value || null),
  contactEmail: optionalEmail,
  phone: optionalText(30),
  businessAddress: optionalText(200),
  legalName: optionalText(160),
  taxId: optionalText(30),
  judicialAddress: optionalText(200),
  salesAuthorization: optionalText(80),
  socialLinks,
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color en formato #RRGGBB."),
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
