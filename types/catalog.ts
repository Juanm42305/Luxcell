export type StockStatus = "available" | "low_stock" | "out_of_stock";

export type ProductCondition = "new" | "used" | "refurbished";

/** Ilustración de respaldo para productos que aún no tienen fotografía. */
export type ProductArtKind = "phone" | "earbuds" | "charger" | "case" | "device";
export type ProductArtView = "front" | "back";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Producto tal como lo ve el público. No incluye existencias ni umbral: solo el estado que calcula
 * la vista `catalog_products` en la base de datos.
 */
export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  brand: Brand;
  model: string;
  category: Category;
  shortDescription: string;
  description: string;
  priceCop: number;
  stockStatus: StockStatus;
  condition: ProductCondition;
  storageCapacity: string | null;
  color: string | null;
  specs: { label: string; value: string }[];
  warrantyTerms: string | null;
  isFeatured: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};
