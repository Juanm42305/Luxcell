"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ProductImage } from "@/types/catalog";
import { ProductPhoto } from "./product-photo";

type ProductGalleryProps = {
  images: ProductImage[];
  categorySlug: string;
  productName: string;
  dimmed: boolean;
};

export function ProductGallery({ images, categorySlug, productName, dimmed }: ProductGalleryProps) {
  const [selectedId, setSelectedId] = useState(images[0]?.id);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-surface p-8 sm:p-12">
        <ProductPhoto
          image={selected}
          categorySlug={categorySlug}
          productName={productName}
          sizes="(min-width: 1024px) 50vw, 100vw"
          dimmed={dimmed}
          priority
        />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((image, index) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                aria-label={`Ver imagen ${index + 1} de ${images.length}`}
                aria-current={image.id === selected?.id ? "true" : undefined}
                onClick={() => setSelectedId(image.id)}
                className={cn(
                  "size-20 overflow-hidden rounded-2xl border bg-surface p-2 transition-colors",
                  image.id === selected?.id ? "border-ink" : "border-line hover:border-muted",
                )}
              >
                <ProductPhoto
                  image={{ ...image, alt: "" }}
                  categorySlug={categorySlug}
                  productName={productName}
                  sizes="80px"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
