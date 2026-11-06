import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getLegalDocument } from "@/features/legal/documents";
import { getBusinessSettings } from "@/services/settings";

type LegalPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const document = getLegalDocument((await params).slug, await getBusinessSettings());
  return { title: document?.title ?? "Página no encontrada" };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const document = getLegalDocument((await params).slug, await getBusinessSettings());
  if (!document) notFound();

  return (
    <Container className="py-12 sm:py-16">
      <article className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          {document.title}
        </h1>
        <div className="legal-text mt-6 space-y-4 text-ink-soft">{document.intro}</div>
        {document.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{section.heading}</h2>
            <div className="legal-text mt-3 space-y-3 text-ink-soft">{section.body}</div>
          </section>
        ))}
      </article>
    </Container>
  );
}
