import type { PublicProduct, StockStatus } from "@/types/catalog";

export function buildWhatsAppUrl(phoneNumber: string | null, message: string): string | null {
  if (!phoneNumber) return null;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/** Mensaje de contacto directo: solo nombra el producto, no incluye datos del visitante. */
export function buildProductMessage(product: Pick<PublicProduct, "name" | "model">): string {
  return [
    "Hola, estoy interesado en el siguiente producto:",
    "",
    `Producto: ${product.name}`,
    `Modelo: ${product.model}`,
    "",
    "Quisiera recibir más información sobre su disponibilidad y características.",
  ].join("\n");
}

export function buildRestockMessage(product: Pick<PublicProduct, "name" | "model">): string {
  return [
    "Hola, vi que el siguiente producto está agotado:",
    "",
    `Producto: ${product.name}`,
    `Modelo: ${product.model}`,
    "",
    "Quisiera saber si volverá a estar disponible.",
  ].join("\n");
}

export function buildGeneralMessage(): string {
  return "Hola, quisiera recibir información sobre sus productos.";
}

/** Un agotado no debe dar a entender que el producto se puede adquirir de inmediato. */
export function getProductContact(
  product: Pick<PublicProduct, "name" | "model">,
  stockStatus: StockStatus,
) {
  return stockStatus === "out_of_stock"
    ? { label: "Preguntar por reposición", message: buildRestockMessage(product) }
    : { label: "Consultar por WhatsApp", message: buildProductMessage(product) };
}
