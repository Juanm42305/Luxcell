import "server-only";
import { getStockStatus } from "@/lib/inventory";
import { requireAdmin } from "./admin-session";

function fail(message: string, code: string | undefined): never {
  console.error(message, code);
  throw new Error(message);
}

export async function listAdminProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, model, price, stock_quantity, low_stock_threshold, is_active, is_featured, updated_at, brands(name), categories(name)",
    )
    .order("updated_at", { ascending: false });
  if (error) fail("No se pudieron cargar los productos", error.code);
  return data.map((product) => ({
    ...product,
    stockStatus: getStockStatus(product.stock_quantity, product.low_stock_threshold),
  }));
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) fail("No se pudo cargar el producto", error.code);
  if (!data) return null;

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("id, storage_path, alt_text, is_primary, display_order")
    .eq("product_id", id)
    .order("display_order");
  if (imagesError) fail("No se pudieron cargar las imágenes", imagesError.code);

  return {
    product: data,
    images: images.map((image) => ({
      ...image,
      url: supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
    })),
  };
}

export async function listAdminCategories() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, display_order, is_active")
    .order("display_order");
  if (error) fail("No se pudieron cargar las categorías", error.code);
  return data;
}

export async function listAdminBrands() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, is_active")
    .order("name");
  if (error) fail("No se pudieron cargar las marcas", error.code);
  return data;
}

export async function getRecentActivity() {
  const { supabase } = await requireAdmin();
  const [products, movements] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("inventory_movements")
      .select(
        "id, product_id, product_name_snapshot, quantity_delta, resulting_quantity, reason, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  if (products.error || movements.error) {
    fail("No se pudo cargar la actividad", products.error?.code ?? movements.error?.code);
  }
  return { latestProducts: products.data, latestMovements: movements.data };
}
