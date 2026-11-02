import Link from "next/link";
import { stockStatusLabels } from "@/lib/inventory";
import type { CatalogFilters } from "@/schemas/catalog-filters";
import type { Brand, Category, StockStatus } from "@/types/catalog";
import { buttonClasses } from "@/components/ui/button";

type CatalogFiltersFormProps = {
  idPrefix: string;
  filters: CatalogFilters;
  categories: Category[];
  brands: Brand[];
};

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-base transition-colors hover:border-muted focus:border-ink focus:outline-none sm:text-sm";

/** Formulario GET: los filtros quedan en la URL, se pueden compartir y funcionan sin JavaScript. */
export function CatalogFiltersForm({
  idPrefix,
  filters,
  categories,
  brands,
}: CatalogFiltersFormProps) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <form action="/catalogo" className="space-y-5">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      <input type="hidden" name="orden" value={filters.orden} />

      <div>
        <label htmlFor={id("categoria")} className="mb-1.5 block text-sm font-medium">
          Categoría
        </label>
        <select
          id={id("categoria")}
          name="categoria"
          defaultValue={filters.categoria ?? ""}
          className={fieldClass}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={id("marca")} className="mb-1.5 block text-sm font-medium">
          Marca
        </label>
        <select
          id={id("marca")}
          name="marca"
          defaultValue={filters.marca ?? ""}
          className={fieldClass}
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Precio (COP)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={id("min")} className="sr-only">
              Precio mínimo
            </label>
            <input
              id={id("min")}
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="Mínimo"
              defaultValue={filters.min}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor={id("max")} className="sr-only">
              Precio máximo
            </label>
            <input
              id={id("max")}
              name="max"
              type="number"
              inputMode="numeric"
              min={0}
              step={10000}
              placeholder="Máximo"
              defaultValue={filters.max}
              className={fieldClass}
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor={id("disponibilidad")} className="mb-1.5 block text-sm font-medium">
          Disponibilidad
        </label>
        <select
          id={id("disponibilidad")}
          name="disponibilidad"
          defaultValue={filters.disponibilidad ?? ""}
          className={fieldClass}
        >
          <option value="">Todas</option>
          {(Object.entries(stockStatusLabels) as [StockStatus, string][]).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button type="submit" className={buttonClasses("primary")}>
          Aplicar filtros
        </button>
        <Link href="/catalogo" className={buttonClasses("ghost")}>
          Limpiar
        </Link>
      </div>
    </form>
  );
}
