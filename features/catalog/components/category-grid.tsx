import Link from "next/link";
import type { Category } from "@/types/catalog";
import { ProductArt } from "./product-art";
import { artKindForCategory } from "./product-photo";

const artTone = "#c9cad0";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/catalogo?categoria=${category.slug}`}
            className="group flex h-full min-h-24 items-center justify-between gap-2 overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-ink/40"
          >
            <span className="text-sm font-medium text-balance">{category.name}</span>
            <ProductArt
              kind={artKindForCategory(category.slug)}
              tone={artTone}
              className="h-14 shrink-0 transition-transform duration-300 ease-soft group-hover:-translate-y-0.5"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
