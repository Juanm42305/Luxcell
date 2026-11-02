import Link from "next/link";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { cn } from "@/lib/cn";
import { formatCop } from "@/lib/format";
import { getProductContact } from "@/lib/whatsapp";
import { getBusinessSettings } from "@/services/settings";
import type { PublicProduct } from "@/types/catalog";
import { ProductPhoto } from "./product-photo";
import { StockBadge } from "./stock-badge";

export async function ProductCard({
  product,
  className,
}: {
  product: PublicProduct;
  className?: string;
}) {
  const { whatsappNumber } = await getBusinessSettings();
  const image = product.images[0];
  const isOut = product.stockStatus === "out_of_stock";
  const contact = getProductContact(product, product.stockStatus);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-[border-color,box-shadow,transform] duration-300 ease-soft hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_16px_40px_-24px_rgb(16_17_20/0.35)]",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-paper p-4 pt-10 sm:p-6 sm:pt-12">
        <ProductPhoto
          image={image}
          categorySlug={product.category.slug}
          productName={product.name}
          sizes="(min-width: 1024px) 25vw, 50vw"
          dimmed={isOut}
          className="transition-transform duration-500 ease-soft group-hover:scale-105"
        />
        <StockBadge
          status={product.stockStatus}
          className="absolute top-2 left-2 sm:top-3 sm:left-3"
        />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="text-xs text-muted">
          {product.brand.name} · {product.model}
        </p>
        <h3 className="mt-1 font-semibold tracking-tight text-balance">
          <Link href={`/producto/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted sm:text-sm">
          {product.shortDescription}
        </p>
        <p className="mt-3 pb-3 text-[15px] font-semibold sm:pb-4 sm:text-lg tracking-tight tabular-nums">
          {formatCop(product.priceCop)}
        </p>

        <div className="mt-auto flex flex-col gap-2">
          <WhatsAppLink
            phoneNumber={whatsappNumber}
            message={contact.message}
            label={contact.label}
            accessibleLabel={`${contact.label}: ${product.name}`}
            tone={isOut ? "quiet" : "solid"}
            size="sm"
          />
          <Link
            href={`/producto/${product.slug}`}
            aria-label={`Ver detalles de ${product.name}`}
            className="flex min-h-11 items-center justify-center rounded-full text-xs font-medium sm:text-sm transition-colors hover:bg-ink/5"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}
