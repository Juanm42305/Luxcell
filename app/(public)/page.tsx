import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryGrid } from "@/features/catalog/components/category-grid";
import { Hero } from "@/features/catalog/components/hero";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ProductRail } from "@/features/catalog/components/product-rail";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { buildGeneralMessage } from "@/lib/whatsapp";
import {
  getAvailableProducts,
  getCategories,
  getFeaturedProducts,
  getLatestProducts,
} from "@/services/catalog";
import { getBusinessSettings } from "@/services/settings";

const steps = [
  { title: "Explora", text: "Revisa fotos, características y precios en pesos colombianos." },
  {
    title: "Verifica",
    text: "Cada producto muestra si está disponible, en últimas unidades o agotado.",
  },
  {
    title: "Escríbenos",
    text: "Abre WhatsApp con el producto ya mencionado y envía tu mensaje cuando quieras.",
  },
];

export default async function HomePage() {
  const [settings, categories, featured, latest, available] = await Promise.all([
    getBusinessSettings(),
    getCategories(),
    getFeaturedProducts(),
    getLatestProducts(),
    getAvailableProducts(),
  ]);

  const contactRows = [
    { label: "Dirección", value: settings.commercialAddress },
    { label: "Teléfono", value: settings.phone },
    { label: "Correo", value: settings.contactEmail },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <>
      <Hero />

      <section id="categorias" aria-labelledby="titulo-categorias" className="py-12 sm:py-16">
        <Container>
          <SectionHeading id="titulo-categorias" title="Categorías" />
          <CategoryGrid categories={categories} />
        </Container>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="titulo-destacados" className="pb-12 sm:pb-16">
          <Container>
            <SectionHeading
              id="titulo-destacados"
              title="Productos destacados"
              action={{ href: "/catalogo", label: "Ver todos" }}
            />
            <ProductGrid products={featured} />
          </Container>
        </section>
      )}

      {latest.length > 0 && (
        <section
          aria-labelledby="titulo-novedades"
          className="border-y border-line bg-surface py-12 sm:py-16"
        >
          <Container>
            <SectionHeading
              id="titulo-novedades"
              title="Últimas novedades"
              action={{ href: "/catalogo?orden=novedades", label: "Ver más" }}
            />
            <ProductRail products={latest} label="Últimas novedades" />
          </Container>
        </section>
      )}

      {available.length > 0 && (
        <section aria-labelledby="titulo-disponibles" className="py-12 sm:py-16">
          <Container>
            <SectionHeading
              id="titulo-disponibles"
              title="Productos disponibles"
              action={{ href: "/catalogo?disponibilidad=available", label: "Ver todos" }}
            />
            <ProductGrid products={available} />
          </Container>
        </section>
      )}

      <section id="negocio" aria-labelledby="titulo-negocio" className="pb-12 sm:pb-16">
        <Container>
          <div className="on-night grid gap-10 rounded-[2rem] bg-night p-6 text-white sm:p-10 lg:grid-cols-2 lg:p-14">
            <div>
              <h2 id="titulo-negocio" className="text-2xl font-semibold tracking-tight sm:text-4xl">
                {settings.name}
              </h2>
              {settings.description && (
                <p className="mt-3 max-w-md font-semibold text-brand">{settings.description}</p>
              )}
              <p className="mt-3 max-w-md text-night-muted">
                Celulares iPhone, Android y accesorios tecnológicos en Montería, Córdoba. Atendemos
                por WhatsApp e Instagram.
              </p>
              {contactRows.length > 0 && (
                <dl className="mt-6 space-y-2 text-sm">
                  {contactRows.map((row) => (
                    <div key={row.label} className="flex flex-wrap gap-x-2">
                      <dt className="text-night-muted">{row.label}:</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <WhatsAppLink
                  phoneNumber={settings.whatsappNumber}
                  message={buildGeneralMessage()}
                  label="Escríbenos por WhatsApp"
                  size="lg"
                />
                <ButtonLink href="/nosotros" variant="inverse" size="lg">
                  Conócenos
                </ButtonLink>
              </div>
            </div>

            <ol className="space-y-6 lg:pl-8">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-brand text-sm font-semibold text-brand"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-night-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  );
}
