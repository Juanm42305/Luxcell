import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductRail } from "@/features/catalog/components/product-rail";
import { StockBadge } from "@/features/catalog/components/stock-badge";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { OfferBadge, ProductPrice } from "@/features/catalog/components/product-price";
import { formatDate } from "@/lib/format";
import { conditionLabels } from "@/lib/product-labels";
import { getProductContact } from "@/lib/whatsapp";
import { getProductBySlug, getRelatedProducts } from "@/services/catalog";
import { getBusinessSettings } from "@/services/settings";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  return { title: product.name, description: product.shortDescription };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [related, { whatsappNumber }] = await Promise.all([
    getRelatedProducts(product),
    getBusinessSettings(),
  ]);
  const isOut = product.stockStatus === "out_of_stock";
  const contact = getProductContact(product, product.stockStatus);

  const details = [
    { label: "Marca", value: product.brand.name },
    { label: "Modelo", value: product.model },
    { label: "Estado", value: conditionLabels[product.condition] },
    { label: "Almacenamiento", value: product.storageCapacity },
    {
      label: product.colors.length > 1 ? "Colores disponibles" : "Color",
      value: product.colors.join(", "),
    },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  return (
    <>
      <Container className="py-6 sm:py-10">
        <nav aria-label="Ruta de navegación" className="mb-5 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li className="flex min-h-11 items-center gap-1">
              <Link href="/catalogo" className="hover:text-ink hover:underline">
                Catálogo
              </Link>
              <ChevronRight aria-hidden className="size-3.5" />
            </li>
            <li className="flex min-h-11 items-center">
              <Link
                href={`/catalogo?categoria=${product.category.slug}`}
                className="hover:text-ink hover:underline"
              >
                {product.category.name}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <ProductGallery
            images={product.images}
            categorySlug={product.category.slug}
            productName={product.name}
            dimmed={isOut}
          />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm text-muted">{product.brand.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StockBadge status={product.stockStatus} />
              <OfferBadge
                priceCop={product.priceCop}
                salePriceCop={product.salePriceCop}
                offerValidUntil={product.offerValidUntil}
              />
            </div>
            <ProductPrice
              size="page"
              priceCop={product.priceCop}
              salePriceCop={product.salePriceCop}
              offerValidUntil={product.offerValidUntil}
              className="mt-3"
            />
            <p className="mt-5 text-ink-soft">{product.description}</p>

            <div className="mt-6">
              <WhatsAppLink
                phoneNumber={whatsappNumber}
                message={contact.message}
                label={contact.label}
                tone={isOut ? "quiet" : "solid"}
                size="lg"
                className="w-full"
              />
              <p className="mt-2 text-center text-xs text-muted">
                Se abrirá WhatsApp con el mensaje listo. Tú decides si lo envías.
              </p>
            </div>

            <dl className="mt-8 divide-y divide-line border-y border-line text-sm">
              {details.map((detail) => (
                <div key={detail.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{detail.label}</dt>
                  <dd className="text-right font-medium">{detail.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-xs text-muted">
              Actualizado el {formatDate(product.updatedAt)}
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="titulo-especificaciones">
            <h2 id="titulo-especificaciones" className="text-xl font-semibold tracking-tight">
              Especificaciones técnicas
            </h2>
            <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
              {product.specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="titulo-garantia">
            <h2 id="titulo-garantia" className="text-xl font-semibold tracking-tight">
              Garantía
            </h2>
            <p className="mt-3 text-sm text-ink-soft">
              {product.warrantyTerms ?? "[Condiciones de garantía: las define el negocio]"}
            </p>
          </section>
        </div>
      </Container>

      {related.length > 0 && (
        <section
          aria-labelledby="titulo-relacionados"
          className="border-t border-line bg-surface py-12"
        >
          <Container>
            <SectionHeading id="titulo-relacionados" title="También te puede interesar" />
            <ProductRail products={related} label="Productos relacionados" />
          </Container>
        </section>
      )}
    </>
  );
}
