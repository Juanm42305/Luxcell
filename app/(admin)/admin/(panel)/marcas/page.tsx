import { deleteBrand, saveBrand } from "@/features/admin/actions/taxonomy";
import { TaxonomyEditor } from "@/features/admin/components/taxonomy-editor";
import { listAdminBrands } from "@/services/admin-catalog";

export default async function AdminBrandsPage() {
  const brands = await listAdminBrands();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Marcas</h1>
      <section aria-labelledby="titulo-nueva-marca" className="mt-6">
        <h2 id="titulo-nueva-marca" className="mb-3 text-lg font-semibold">
          Nueva marca
        </h2>
        <TaxonomyEditor kind="brand" save={saveBrand.bind(null, null)} />
      </section>
      <section aria-labelledby="titulo-marcas-existentes" className="mt-10">
        <h2 id="titulo-marcas-existentes" className="mb-3 text-lg font-semibold">
          Marcas existentes
        </h2>
        {brands.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay marcas. Crea la primera arriba.</p>
        ) : (
          <ul className="space-y-3">
            {brands.map((brand) => (
              <li key={brand.id}>
                <TaxonomyEditor
                  kind="brand"
                  item={brand}
                  save={saveBrand.bind(null, brand.id)}
                  remove={deleteBrand.bind(null, brand.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
