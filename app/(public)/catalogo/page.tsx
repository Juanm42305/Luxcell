import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteSearch } from "@/components/layout/site-search";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CatalogFiltersForm } from "@/features/catalog/components/catalog-filters-form";
import { FilterSheet } from "@/features/catalog/components/filter-sheet";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { SortSelect } from "@/features/catalog/components/sort-select";
import { parseCatalogFilters } from "@/schemas/catalog-filters";
import { getBrands, getCategories, listProducts } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Celulares y accesorios con precio en pesos colombianos y disponibilidad actualizada.",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const filters = parseCatalogFilters(await searchParams);
  const [products, categories, brands] = await Promise.all([
    listProducts(filters),
    getCategories(),
    getBrands(),
  ]);

  const activeCategory = categories.find((category) => category.slug === filters.categoria);
  const activeFilterCount = [
    filters.categoria,
    filters.marca,
    filters.min,
    filters.max,
    filters.disponibilidad,
  ].filter((value) => value !== undefined).length;

  const formProps = { filters, categories, brands };

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
        {activeCategory?.name ?? "Catálogo"}
      </h1>
      {filters.q && (
        <p className="mt-2 text-muted">
          Resultados para <span className="font-medium text-ink">“{filters.q}”</span>
        </p>
      )}

      <SiteSearch id="busqueda-catalogo" className="mt-5 md:hidden" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="w-full text-sm text-muted sm:w-auto">
          {products.length === 1 ? "1 producto" : `${products.length} productos`}
        </p>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <FilterSheet activeCount={activeFilterCount}>
            <CatalogFiltersForm idPrefix="movil" {...formProps} />
          </FilterSheet>
          <Suspense>
            <SortSelect value={filters.orden} />
          </Suspense>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-8">
        <aside
          aria-label="Filtros del catálogo"
          className="hidden rounded-3xl border border-line bg-surface p-5 lg:sticky lg:top-20 lg:block"
        >
          <CatalogFiltersForm idPrefix="escritorio" {...formProps} />
        </aside>

        {products.length > 0 ? (
          <ProductGrid
            products={products}
            className="md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <SearchX aria-hidden className="mx-auto size-8 text-muted" />
            <h2 className="mt-3 text-lg font-semibold">No encontramos productos</h2>
            <p className="mt-1 text-sm text-muted">
              Prueba con otra búsqueda o quita algunos filtros.
            </p>
            <ButtonLink href="/catalogo" variant="secondary" className="mt-5">
              Ver todo el catálogo
            </ButtonLink>
          </div>
        )}
      </div>
    </Container>
  );
}
