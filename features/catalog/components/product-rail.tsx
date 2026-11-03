import type { PublicProduct } from "@/types/catalog";
import { ProductCard } from "./product-card";

/** Carril horizontal con desplazamiento por toque; sale hasta el borde de la pantalla en móvil. */
export function ProductRail({ products, label }: { products: PublicProduct[]; label: string }) {
  return (
    <ul
      aria-label={label}
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8"
    >
      {products.map((product) => (
        <li key={product.id} className="w-[46%] max-w-72 min-w-40 shrink-0 snap-start sm:w-72">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
