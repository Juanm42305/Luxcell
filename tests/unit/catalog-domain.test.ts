import { describe, expect, it } from "vitest";
import { formatCop } from "@/lib/format";
import { getStockStatus } from "@/lib/inventory";
import { toSearchPattern } from "@/lib/search";
import { toSlug } from "@/lib/slug";
import { buildProductMessage, buildWhatsAppUrl, getProductContact } from "@/lib/whatsapp";
import { parseBrandColor, parseSocialLinks } from "@/schemas/business-settings";
import { parseCatalogFilters } from "@/schemas/catalog-filters";

describe("getStockStatus", () => {
  it("muestra disponible por encima del umbral", () => {
    expect(getStockStatus(4, 3)).toBe("available");
  });

  it("muestra últimas unidades en el umbral o por debajo", () => {
    expect(getStockStatus(3, 3)).toBe("low_stock");
    expect(getStockStatus(1, 3)).toBe("low_stock");
  });

  it("muestra agotado en cero, incluso con umbral cero", () => {
    expect(getStockStatus(0, 3)).toBe("out_of_stock");
    expect(getStockStatus(0, 0)).toBe("out_of_stock");
  });
});

describe("formatCop", () => {
  it("usa el formato colombiano", () => {
    expect(formatCop(2_500_000)).toBe("$2.500.000 COP");
    expect(formatCop(95_000)).toBe("$95.000 COP");
  });
});

describe("WhatsApp", () => {
  const product = { name: "Equipo & Cía", model: "X/1" };

  it("no genera enlace sin número configurado", () => {
    expect(buildWhatsAppUrl(null, "Hola")).toBeNull();
  });

  it("usa wa.me y codifica el mensaje", () => {
    const url = buildWhatsAppUrl("573000000000", buildProductMessage(product));
    expect(url).toMatch(/^https:\/\/wa\.me\/573000000000\?text=/);
    expect(decodeURIComponent(url!.split("text=")[1]!)).toContain("Producto: Equipo & Cía");
  });

  it("un agotado no invita a comprar", () => {
    const contact = getProductContact(product, "out_of_stock");
    expect(contact.label).toBe("Preguntar por reposición");
    expect(contact.message).toContain("agotado");
  });
});

describe("filtros del catálogo", () => {
  it("ignora parámetros inválidos sin fallar", () => {
    const filters = parseCatalogFilters({ min: "abc", orden: "hackeo", disponibilidad: "x" });
    expect(filters.min).toBeUndefined();
    expect(filters.orden).toBe("novedades");
    expect(filters.disponibilidad).toBeUndefined();
  });

  it("trata los campos vacíos del formulario como ausentes", () => {
    const filters = parseCatalogFilters({ q: "", min: "", max: "", marca: "" });
    expect(filters).toMatchObject({
      q: undefined,
      min: undefined,
      max: undefined,
      marca: undefined,
    });
  });
});

describe("toSearchPattern", () => {
  it("quita tildes y mayúsculas", () => {
    expect(toSearchPattern("AUDÍFONOS")).toBe("%audifonos%");
  });

  it("trata los comodines como texto literal", () => {
    expect(toSearchPattern("100%_a\\")).toBe("%100\\%\\_a\\\\%");
  });
});

describe("toSlug", () => {
  it("genera identificadores válidos", () => {
    expect(toSlug("iPhone 15 Pro (128 GB)")).toBe("iphone-15-pro-128-gb");
    expect(toSlug("  ¡Audífonos Bluetooth!  ")).toBe("audifonos-bluetooth");
    expect(toSlug("---")).toBe("");
  });

  it("es rápido con entradas diseñadas para causar backtracking", () => {
    const start = performance.now();
    toSlug("-".repeat(50_000) + "a" + "-".repeat(50_000));
    expect(performance.now() - start).toBeLessThan(200);
  });

  it("no termina en guion tras recortar a 120 caracteres", () => {
    expect(toSlug("a".repeat(119) + " b")).not.toMatch(/-$/);
  });
});

describe("configuración del negocio", () => {
  it("rechaza enlaces sociales que no sean https", () => {
    expect(parseSocialLinks([{ label: "x", href: "javascript:alert(1)" }])).toEqual([]);
    expect(parseSocialLinks([{ label: "x", href: "http://red.example" }])).toEqual([]);
    expect(parseSocialLinks([{ label: "Red", href: "https://red.example/x" }])).toHaveLength(1);
  });

  it("solo acepta colores hexadecimales", () => {
    expect(parseBrandColor({ primary: "#2438e0" })).toBe("#2438e0");
    expect(parseBrandColor({ primary: "red;background:url(x)" })).toBeNull();
  });
});
