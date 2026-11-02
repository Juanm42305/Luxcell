import { cn } from "@/lib/cn";
import type { PublicProduct } from "@/types/catalog";
import { ProductCard } from "./product-card";

/** Dos columnas desde el teléfono más angosto, para ver varios productos sin desplazarse tanto. */
export function ProductGrid({
  products,
  className,
}: {
  products: PublicProduct[];
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4", className ?? "lg:grid-cols-4")}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
