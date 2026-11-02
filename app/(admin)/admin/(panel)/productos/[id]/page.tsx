import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { publishProductImage } from "@/features/admin/actions/images";
import { deleteProduct, updateProduct, updateStock } from "@/features/admin/actions/products";
import { ConfirmButton } from "@/features/admin/components/confirm-button";
import { ImageManager } from "@/features/admin/components/image-manager";
import { ImageUploader } from "@/features/admin/components/image-uploader";
import { ProductForm } from "@/features/admin/components/product-form";
import { StockForm } from "@/features/admin/components/stock-form";
import { StockBadge } from "@/features/catalog/components/stock-badge";
import { adminHref } from "@/lib/admin-path";
import { formatDate } from "@/lib/format";
import { getStockStatus } from "@/lib/inventory";
import { getAdminProduct, listAdminBrands, listAdminCategories } from "@/services/admin-catalog";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string }>;
};

const specsSchema = z.array(z.object({ label: z.string(), value: z.string() }));

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const { id } = await params;
  const { creado } = await searchParams;
  if (!z.uuid().safeParse(id).success) notFound();

  const [result, brands, categories] = await Promise.all([
    getAdminProduct(id),
    listAdminBrands(),
    listAdminCategories(),
  ]);
  if (!result) notFound();
  const { product, images } = result;
  const specs = specsSchema.safeParse(product.specs);

  return (
    <div className="max-w-4xl">
      <Link href={adminHref("/productos")} className="text-sm text-muted hover:text-ink">
        ← Productos
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
        <StockBadge status={getStockStatus(product.stock_quantity, product.low_stock_threshold)} />
        {!product.is_active && (
          <span className="rounded-full bg-off-soft px-2.5 py-1 text-xs font-medium text-off">
            Oculto
          </span>
        )}
      </div>
      {product.is_active && (
        <a
          href={`/producto/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline"
        >
          Ver en la web <ExternalLink aria-hidden className="size-3.5" />
        </a>
      )}
      {creado && (
        <p role="status" className="mt-4 rounded-xl bg-ok-soft px-3 py-2 text-sm text-ok">
          Producto creado. Ahora agrega sus fotos.
        </p>
      )}

      <section aria-labelledby="titulo-fotos" className="mt-10">
        <h2 id="titulo-fotos" className="text-xl font-semibold">
          Fotos
        </h2>
        <div className="mt-4 space-y-6">
          <ImageManager images={images} />
          <ImageUploader
            label="Elegir fotos para agregar"
            publish={publishProductImage.bind(null, product.id, product.name)}
          />
        </div>
      </section>

      <section aria-labelledby="titulo-inventario" className="mt-12">
        <h2 id="titulo-inventario" className="text-xl font-semibold">
          Inventario
        </h2>
        <p className="mt-1 text-sm text-muted">
          Última actualización: {formatDate(product.stock_updated_at)}
        </p>
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
          <StockForm
            action={updateStock.bind(null, product.id)}
            currentQuantity={product.stock_quantity}
          />
        </div>
      </section>

      <section aria-labelledby="titulo-datos" className="mt-12">
        <h2 id="titulo-datos" className="sr-only">
          Datos del producto
        </h2>
        <ProductForm
          action={updateProduct.bind(null, product.id)}
          brands={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          categories={categories.map((category) => ({ value: category.id, label: category.name }))}
          initial={{ ...product, specs: specs.success ? specs.data : [] }}
        />
      </section>

      <section aria-labelledby="titulo-eliminar" className="mt-12 border-t border-line pt-8">
        <h2 id="titulo-eliminar" className="text-lg font-semibold">
          Eliminar producto
        </h2>
        <p className="mt-1 text-sm text-muted">
          Si solo quieres ocultarlo, desmarca «Visible en la web». Eliminar borra también sus fotos.
        </p>
        <div className="mt-3">
          <ConfirmButton
            action={deleteProduct.bind(null, product.id)}
            label="Eliminar producto"
            confirmText={`¿Eliminar «${product.name}» y todas sus fotos? No se puede deshacer.`}
          />
        </div>
      </section>
    </div>
  );
}
