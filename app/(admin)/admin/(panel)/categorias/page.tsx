import { deleteCategory, saveCategory } from "@/features/admin/actions/taxonomy";
import { TaxonomyEditor } from "@/features/admin/components/taxonomy-editor";
import { listAdminCategories } from "@/services/admin-catalog";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories();

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Categorías</h1>
      <section aria-labelledby="titulo-nueva-categoria" className="mt-6">
        <h2 id="titulo-nueva-categoria" className="mb-3 text-lg font-semibold">
          Nueva categoría
        </h2>
        <TaxonomyEditor kind="category" save={saveCategory.bind(null, null)} />
      </section>
      <section aria-labelledby="titulo-categorias-existentes" className="mt-10">
        <h2 id="titulo-categorias-existentes" className="mb-3 text-lg font-semibold">
          Categorías existentes
        </h2>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.id}>
              <TaxonomyEditor
                kind="category"
                item={category}
                save={saveCategory.bind(null, category.id)}
                remove={deleteCategory.bind(null, category.id)}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
