"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CatalogFilters } from "@/schemas/catalog-filters";

export function SortSelect({ value }: { value: CatalogFilters["orden"] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function changeSort(order: string) {
    const params = new URLSearchParams(searchParams);
    params.set("orden", order);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
      <label
        htmlFor="orden"
        className="sr-only sm:not-sr-only sm:text-sm sm:whitespace-nowrap sm:text-muted"
      >
        Ordenar por
      </label>
      <select
        id="orden"
        value={value}
        onChange={(event) => changeSort(event.target.value)}
        className="h-11 w-full min-w-0 rounded-full border border-line bg-surface px-4 text-base transition-colors hover:border-muted focus:border-ink focus:outline-none sm:text-sm"
      >
        <option value="novedades">Novedades</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
      </select>
    </div>
  );
}
