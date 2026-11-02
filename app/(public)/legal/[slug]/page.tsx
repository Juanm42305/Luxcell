import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { legalLinks } from "@/config/site";

type LegalPageProps = { params: Promise<{ slug: string }> };

function findLegalPage(slug: string) {
  return legalLinks.find((link) => link.href === `/legal/${slug}`);
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const page = findLegalPage((await params).slug);
  return { title: page?.label ?? "Página no encontrada" };
}

/** Marcador de diseño: los documentos legales se redactan en la Fase 6. */
export default async function LegalPage({ params }: LegalPageProps) {
  const page = findLegalPage((await params).slug);
  if (!page) notFound();

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        {page.label}
      </h1>
      <p className="mt-5 rounded-2xl border border-dashed border-line p-5 text-ink-soft">
        [Documento pendiente. Se redacta con los datos reales del negocio y debe pasar por revisión
        jurídica antes de publicarse.]
      </p>
    </Container>
  );
}
