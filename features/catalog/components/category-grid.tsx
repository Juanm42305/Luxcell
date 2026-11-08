import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/catalog";
import { ProductArt } from "./product-art";
import { artKindForCategory } from "./product-photo";

const artTone = "#c9cad0";

/** Logos de marca por categoría. Las marcas pertenecen a sus titulares y solo identifican productos. */
const categoryLogos: Record<string, { src: string; width: number; height: number }> = {
  iphone: { src: "/brand/categorias/iphone.webp", width: 131, height: 160 },
  samsung: { src: "/brand/categorias/samsung.webp", width: 240, height: 41 },
  xiaomi: { src: "/brand/categorias/xiaomi.webp", width: 160, height: 160 },
  motorola: { src: "/brand/categorias/motorola.webp", width: 240, height: 133 },
  "otros-android": { src: "/brand/categorias/otros-android.webp", width: 135, height: 160 },
  cargadores: { src: "/brand/categorias/cargadores.webp", width: 240, height: 148 },
  audifonos: { src: "/brand/categorias/audifonos.webp", width: 160, height: 160 },
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => {
        const logo = categoryLogos[category.slug];
        return (
          <li key={category.id}>
            <Link
              href={`/catalogo?categoria=${category.slug}`}
              className="group flex h-full min-h-24 items-center justify-between gap-2 overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-ink/40"
            >
              <span className="text-sm font-medium text-balance">{category.name}</span>
              {logo ? (
                <Image
                  src={logo.src}
                  alt=""
                  width={logo.width}
                  height={logo.height}
                  className="h-12 w-16 shrink-0 object-contain transition-transform duration-300 ease-soft group-hover:-translate-y-0.5"
                />
              ) : (
                <ProductArt
                  kind={artKindForCategory(category.slug)}
                  tone={artTone}
                  className="h-14 shrink-0 transition-transform duration-300 ease-soft group-hover:-translate-y-0.5"
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
