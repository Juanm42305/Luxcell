import "server-only";
import { z } from "zod";
import { toSearchPattern } from "@/lib/search";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogFilters } from "@/schemas/catalog-filters";
import type { Brand, Category, ProductImage, PublicProduct, StockStatus } from "@/types/catalog";
import type { Database } from "@/types/database";

const MAX_LISTED_PRODUCTS = 200;

type CatalogRow = Database["public"]["Views"]["catalog_products"]["Row"];
type ImageRow = Database["public"]["Views"]["catalog_product_images"]["Row"];

const specsSchema = z.array(z.object({ label: z.string(), value: z.string() }));

function failWith(message: string, code: string): never {
  // Solo el código: el detalle no debe llegar a los registros ni al visitante.
  console.error(message, code);
  throw new Error(message);
}

function toPublicProduct(row: CatalogRow, images: ProductImage[]): PublicProduct {
  const specs = specsSchema.safeParse(row.specs);
  return {
    id: row.id!,
    name: row.name!,
    slug: row.slug!,
    brand: { id: row.brand_id!, name: row.brand_name!, slug: row.brand_slug! },
    model: row.model!,
    category: {
      id: row.category_id!,
      name: row.category_name!,
      slug: row.category_slug!,
      description: null,
    },
    shortDescription: row.short_description!,
    description: row.description!,
    priceCop: row.price!,
    stockStatus: row.stock_status as StockStatus,
    condition: row.condition!,
    storageCapacity: row.storage_capacity,
    color: row.color,
    specs: specs.success ? specs.data : [],
    warrantyTerms: row.warranty_terms,
    isFeatured: row.is_featured!,
    images,
    createdAt: row.created_at!,
    updatedAt: row.updated_at!,
  };
}

async function withImages(rows: CatalogRow[]): Promise<PublicProduct[]> {
  if (rows.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("catalog_product_images")
    .select("*")
    .in(
      "product_id",
      rows.map((row) => row.id!),
    )
    .order("is_primary", { ascending: false })
    .order("display_order");

  if (error) failWith("No se pudieron cargar las imágenes", error.code);

  const byProduct = new Map<string, ProductImage[]>();
  for (const image of data as ImageRow[]) {
    const list = byProduct.get(image.product_id!) ?? [];
    list.push({
      id: image.id!,
      url: supabase.storage.from("product-images").getPublicUrl(image.storage_path!).data.publicUrl,
      alt: image.alt_text!,
    });
    byProduct.set(image.product_id!, list);
  }

  return rows.map((row) => toPublicProduct(row, byProduct.get(row.id!) ?? []));
}

export async function listProducts(filters: CatalogFilters): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  let query = supabase.from("catalog_products").select("*").limit(MAX_LISTED_PRODUCTS);

  if (filters.q) query = query.ilike("search_text", toSearchPattern(filters.q));
  if (filters.categoria) query = query.eq("category_slug", filters.categoria);
  if (filters.marca) query = query.eq("brand_slug", filters.marca);
  if (filters.min !== undefined) query = query.gte("price", filters.min);
  if (filters.max !== undefined) query = query.lte("price", filters.max);
  if (filters.disponibilidad) query = query.eq("stock_status", filters.disponibilidad);

  query =
    filters.orden === "novedades"
      ? query.order("created_at", { ascending: false })
      : query.order("price", { ascending: filters.orden === "precio-asc" });

  const { data, error } = await query;
  if (error) failWith("No se pudo cargar el catálogo", error.code);
  return withImages(data);
}

export async function getFeaturedProducts(limit = 4): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los destacados", error.code);
  return withImages(data);
}

export async function getLatestProducts(limit = 6): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar las novedades", error.code);
  return withImages(data);
}

export async function getAvailableProducts(limit = 8): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .neq("stock_status", "out_of_stock")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los disponibles", error.code);
  return withImages(data);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) failWith("No se pudo cargar el producto", error.code);
  if (!data) return null;
  const [product] = await withImages([data]);
  return product ?? null;
}

export async function getRelatedProducts(
  product: PublicProduct,
  limit = 4,
): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .eq("category_slug", product.category.slug)
    .neq("id", product.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los relacionados", error.code);
  return withImages(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, description")
    .order("display_order");
  if (error) failWith("No se pudieron cargar las categorías", error.code);
  return data;
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await createPublicClient()
    .from("brands")
    .select("id, name, slug")
    .order("name");
  if (error) failWith("No se pudieron cargar las marcas", error.code);
  return data;
}
