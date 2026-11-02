import type { StockStatus } from "@/types/catalog";

export const stockStatusLabels: Record<StockStatus, string> = {
  available: "Disponible",
  low_stock: "Últimas unidades",
  out_of_stock: "Agotado",
};

export function getStockStatus(quantity: number, lowStockThreshold: number): StockStatus {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= lowStockThreshold) return "low_stock";
  return "available";
}
