import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { CATALOG_CACHE, CATALOG_TAG } from "@/lib/cache-tags";
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
    salePriceCop: row.sale_price,
    offerValidUntil: row.offer_valid_until,
    stockStatus: row.stock_status as StockStatus,
    condition: row.condition!,
    storageCapacity: row.storage_capacity,
    colors: row.colors ?? [],
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

async function fetchProducts(filters: CatalogFilters): Promise<PublicProduct[]> {
  const supabase = createPublicClient();
  let query = supabase.from("catalog_products").select("*").limit(MAX_LISTED_PRODUCTS);

  if (filters.q) query = query.ilike("search_text", toSearchPattern(filters.q));
  if (filters.categoria) query = query.eq("category_slug", filters.categoria);
  if (filters.marca) query = query.eq("brand_slug", filters.marca);
  // Filtra y ordena por lo que el cliente paga hoy: el precio en oferta si la hay.
  if (filters.min !== undefined) query = query.gte("effective_price", filters.min);
  if (filters.max !== undefined) query = query.lte("effective_price", filters.max);
  if (filters.disponibilidad) query = query.eq("stock_status", filters.disponibilidad);

  query =
    filters.orden === "novedades"
      ? query.order("created_at", { ascending: false })
      : query.order("effective_price", { ascending: filters.orden === "precio-asc" });

  const { data, error } = await query;
  if (error) failWith("No se pudo cargar el catálogo", error.code);
  return withImages(data);
}

async function fetchFeaturedProducts(limit = 4): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los destacados", error.code);
  return withImages(data);
}

async function fetchLatestProducts(limit = 6): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar las novedades", error.code);
  return withImages(data);
}

async function fetchAvailableProducts(limit = 8): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .neq("stock_status", "out_of_stock")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los disponibles", error.code);
  return withImages(data);
}

async function fetchProductBySlug(slug: string): Promise<PublicProduct | null> {
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

async function fetchRelatedProducts(
  categorySlug: string,
  productId: string,
  limit: number,
): Promise<PublicProduct[]> {
  const { data, error } = await createPublicClient()
    .from("catalog_products")
    .select("*")
    .eq("category_slug", categorySlug)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) failWith("No se pudieron cargar los relacionados", error.code);
  return withImages(data);
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("id, name, slug, description")
    .order("display_order");
  if (error) failWith("No se pudieron cargar las categorías", error.code);
  return data;
}

async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await createPublicClient()
    .from("brands")
    .select("id, name, slug")
    .order("name");
  if (error) failWith("No se pudieron cargar las marcas", error.code);
  return data;
}

/*
 * Lecturas públicas en caché compartida. Se renuevan solas cada pocos minutos y el panel las
 * invalida al instante al guardar cualquier cambio (etiqueta CATALOG_TAG). Así la mayoría de
 * visitas no consultan la base de datos.
 */
const cacheOptions = { tags: [CATALOG_TAG], revalidate: CATALOG_CACHE.revalidateSeconds };

export const listProducts = unstable_cache(fetchProducts, ["catalogo:lista"], cacheOptions);
export const getFeaturedProducts = unstable_cache(
  fetchFeaturedProducts,
  ["catalogo:destacados"],
  cacheOptions,
);
export const getLatestProducts = unstable_cache(
  fetchLatestProducts,
  ["catalogo:novedades"],
  cacheOptions,
);
export const getAvailableProducts = unstable_cache(
  fetchAvailableProducts,
  ["catalogo:disponibles"],
  cacheOptions,
);
export const getProductBySlug = unstable_cache(
  fetchProductBySlug,
  ["catalogo:producto"],
  cacheOptions,
);
export const getCategories = unstable_cache(fetchCategories, ["catalogo:categorias"], cacheOptions);
export const getBrands = unstable_cache(fetchBrands, ["catalogo:marcas"], cacheOptions);

const cachedRelatedProducts = unstable_cache(
  fetchRelatedProducts,
  ["catalogo:relacionados"],
  cacheOptions,
);

export function getRelatedProducts(product: PublicProduct, limit = 4): Promise<PublicProduct[]> {
  return cachedRelatedProducts(product.category.slug, product.id, limit);
}
