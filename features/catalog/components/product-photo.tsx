import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ProductArtKind, ProductImage } from "@/types/catalog";
import { ProductArt } from "./product-art";

const artByCategory: Record<string, ProductArtKind> = {
  audifonos: "earbuds",
  cargadores: "charger",
  "protectores-fundas": "case",
  accesorios: "device",
  "otros-tecnologicos": "device",
};

export function artKindForCategory(slug: string): ProductArtKind {
  return artByCategory[slug] ?? "phone";
}

type ProductPhotoProps = {
  image?: ProductImage;
  categorySlug: string;
  productName: string;
  sizes: string;
  dimmed?: boolean;
  priority?: boolean;
  className?: string;
};

/** Muestra la fotografía real o, si el producto aún no tiene, una ilustración de respaldo. */
export function ProductPhoto({
  image,
  categorySlug,
  productName,
  sizes,
  dimmed,
  priority,
  className,
}: ProductPhotoProps) {
  const dimClass = dimmed && "opacity-55 grayscale";

  if (!image) {
    return (
      <ProductArt
        kind={artKindForCategory(categorySlug)}
        tone="#c9cad0"
        alt={`${productName}: fotografía pendiente`}
        className={cn("mx-auto h-full", dimClass, className)}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain", dimClass, className)}
      />
    </div>
  );
}
