import Link from "next/link";
import { createProduct } from "@/features/admin/actions/products";
import { ProductForm } from "@/features/admin/components/product-form";
import { adminHref } from "@/lib/admin-path";
import { listAdminBrands, listAdminCategories } from "@/services/admin-catalog";

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([listAdminBrands(), listAdminCategories()]);

  return (
    <div className="max-w-3xl">
      <Link href={adminHref("/productos")} className="text-sm text-muted hover:text-ink">
        ← Productos
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Nuevo producto</h1>
      <p className="mt-2 text-sm text-muted">Después de crearlo podrás agregar las fotos.</p>
      <div className="mt-8">
        <ProductForm
          action={createProduct}
          brands={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          categories={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
      </div>
    </div>
  );
}
