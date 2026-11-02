import "server-only";
import { getStockStatus } from "@/lib/inventory";
import { requireAdmin } from "./admin-session";

export async function getDashboardStats() {
  const { supabase } = await requireAdmin();

  const [products, inquiries] = await Promise.all([
    supabase.from("products").select("stock_quantity, low_stock_threshold"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
  ]);

  if (products.error || inquiries.error) {
    console.error("No se pudo cargar el panel", products.error?.code ?? inquiries.error?.code);
    throw new Error("No se pudo cargar el panel");
  }

  const statuses = products.data.map((product) =>
    getStockStatus(product.stock_quantity, product.low_stock_threshold),
  );

  return {
    total: statuses.length,
    available: statuses.filter((status) => status === "available").length,
    lowStock: statuses.filter((status) => status === "low_stock").length,
    outOfStock: statuses.filter((status) => status === "out_of_stock").length,
    inquiries: inquiries.count ?? 0,
  };
}
