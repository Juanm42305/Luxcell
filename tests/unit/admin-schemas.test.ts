import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  brandSchema,
  categorySchema,
  formToObject,
  newProductSchema,
  productSchema,
  stockSchema,
  toFieldErrors,
  uploadPathSchema,
} from "@/schemas/admin";
import { loginSchema, newPasswordSchema, totpCodeSchema } from "@/schemas/auth";

const uuid = "3f2b1c9e-0a1b-4c2d-8e3f-123456789abc";

const validProduct = {
  name: "iPhone 15",
  slug: "iphone-15-128gb",
  model: "A3090",
  brandId: uuid,
  categoryId: uuid,
  shortDescription: "Celular de prueba",
  description: "Descripción completa",
  price: "$2.500.000",
  lowStockThreshold: "3",
  condition: "new",
  storageCapacity: "128 GB",
  colors: "",
  salePrice: "",
  specs: "Pantalla: 6,1 pulgadas\nHora: 10:30",
  warrantyTerms: "",
  offerValidUntil: "",
  isFeatured: "on",
};

describe("productSchema", () => {
  it("acepta un producto válido y normaliza los valores", () => {
    const result = productSchema.parse(validProduct);
    expect(result.price).toBe(2_500_000);
    expect(result.colors).toEqual([]);
    expect(result.salePrice).toBeNull();
    expect(result.offerValidUntil).toBeNull();
    expect(result.isFeatured).toBe(true);
    expect(result.isActive).toBe(false);
    expect(result.specs).toEqual([
      { label: "Pantalla", value: "6,1 pulgadas" },
      { label: "Hora", value: "10:30" },
    ]);
  });

  it("rechaza precios negativos, no numéricos y slugs inválidos", () => {
    expect(productSchema.safeParse({ ...validProduct, price: "-5" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, price: "abc" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, slug: "Con Espacios" }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, brandId: "x" }).success).toBe(false);
  });

  it("rechaza especificaciones mal formadas o demasiadas", () => {
    expect(productSchema.safeParse({ ...validProduct, specs: "sin separador" }).success).toBe(
      false,
    );
    const many = Array.from({ length: 31 }, (_, i) => `Dato ${i}: valor`).join("\n");
    expect(productSchema.safeParse({ ...validProduct, specs: many }).success).toBe(false);
  });

  it("valida la fecha de la oferta", () => {
    const offer = { ...validProduct, salePrice: "2.300.000" };
    expect(productSchema.parse({ ...offer, offerValidUntil: "2026-12-31" }).offerValidUntil).toBe(
      "2026-12-31",
    );
    expect(productSchema.safeParse({ ...offer, offerValidUntil: "31/12/2026" }).success).toBe(
      false,
    );
  });

  it("acepta un precio en oferta menor que el normal", () => {
    expect(productSchema.parse({ ...validProduct, salePrice: "$2.300.000" }).salePrice).toBe(
      2_300_000,
    );
  });

  it("rechaza ofertas iguales o mayores al precio, y fechas sin precio en oferta", () => {
    for (const salePrice of ["2500000", "2600000", "-1"]) {
      const result = productSchema.safeParse({ ...validProduct, salePrice });
      expect(result.success).toBe(false);
      if (!result.success) expect(toFieldErrors(result.error).salePrice).toBeDefined();
    }
    const noPrice = productSchema.safeParse({ ...validProduct, offerValidUntil: "2026-12-31" });
    expect(noPrice.success).toBe(false);
    if (!noPrice.success) expect(toFieldErrors(noPrice.error).salePrice).toBeDefined();
    expect(
      newProductSchema.safeParse({ ...validProduct, initialStock: "1", salePrice: "3000000" })
        .success,
    ).toBe(false);
  });

  it("convierte los colores en lista, sin vacíos ni repetidos", () => {
    const result = productSchema.parse({
      ...validProduct,
      colors: " Negro \n\nblanco\nNEGRO\nTitanio   natural",
    });
    expect(result.colors).toEqual(["Negro", "blanco", "Titanio natural"]);
  });

  it("limita la cantidad y el largo de los colores", () => {
    const many = Array.from({ length: 13 }, (_, i) => `Color ${i}`).join("\n");
    expect(productSchema.safeParse({ ...validProduct, colors: many }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, colors: "x".repeat(41) }).success).toBe(
      false,
    );
  });

  it("solo acepta los cuatro estados del producto", () => {
    for (const condition of ["new", "display", "like_new", "refurbished"]) {
      expect(productSchema.safeParse({ ...validProduct, condition }).success).toBe(true);
    }
    expect(productSchema.safeParse({ ...validProduct, condition: "used" }).success).toBe(false);
  });

  it("exige existencias iniciales al crear", () => {
    expect(newProductSchema.parse({ ...validProduct, initialStock: "10" }).initialStock).toBe(10);
    expect(newProductSchema.safeParse(validProduct).success).toBe(false);
  });
});

describe("esquemas de inventario y taxonomía", () => {
  it("valida existencias", () => {
    expect(stockSchema.parse({ quantity: "5", reason: "" })).toEqual({ quantity: 5, reason: null });
    expect(stockSchema.safeParse({ quantity: "100001", reason: "" }).success).toBe(false);
  });

  it("valida categorías y marcas", () => {
    expect(
      categorySchema.parse({
        name: "Celulares",
        slug: "celulares",
        description: "",
        displayOrder: "1",
      }),
    ).toMatchObject({ displayOrder: 1, description: null, isActive: false });
    expect(brandSchema.safeParse({ name: "", slug: "apple" }).success).toBe(false);
  });

  it("solo acepta nombres de archivo generados por el servidor", () => {
    expect(uploadPathSchema.safeParse(`${uuid}.webp`).success).toBe(true);
    expect(uploadPathSchema.safeParse("../../etc/passwd").success).toBe(false);
    expect(uploadPathSchema.safeParse(`${uuid}.php`).success).toBe(false);
  });
});

describe("utilidades de formularios", () => {
  it("toFieldErrors guarda el primer mensaje de cada campo", () => {
    const result = brandSchema.safeParse({ name: "", slug: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = toFieldErrors(result.error);
      expect(errors.name).toBe("El nombre es obligatorio.");
      expect(errors.slug).toBe("El identificador es obligatorio.");
    }
  });

  it("toFieldErrors agrupa los errores sin campo bajo 'form'", () => {
    const result = z
      .object({ a: z.string() })
      .refine(() => false, "Error general")
      .safeParse({ a: "x" });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)).toEqual({ form: "Error general" });
  });

  it("formToObject ignora archivos y campos internos de React", () => {
    const form = new FormData();
    form.append("name", "Apple");
    form.append("$ACTION_ID_x", "interno");
    form.append("file", new Blob(["x"]), "a.jpg");
    expect(formToObject(form)).toEqual({ name: "Apple" });
  });
});

describe("esquemas de autenticación", () => {
  it("valida el login", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a", password: "" }).success).toBe(false);
  });

  it("exige contraseñas robustas", () => {
    expect(newPasswordSchema.safeParse("Clave-Segura-2026").success).toBe(true);
    for (const weak of ["corta1A", "sinmayusculas123", "SINMINUSCULAS123", "SinNumerosAqui"]) {
      expect(newPasswordSchema.safeParse(weak).success).toBe(false);
    }
  });

  it("acepta solo códigos TOTP de 6 dígitos", () => {
    expect(totpCodeSchema.safeParse("123456").success).toBe(true);
    expect(totpCodeSchema.safeParse("12345a").success).toBe(false);
  });
});
