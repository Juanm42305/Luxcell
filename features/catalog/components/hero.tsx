import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getBusinessSettings } from "@/services/settings";
import { ProductArt } from "./product-art";

export async function Hero() {
  const { slogan } = await getBusinessSettings();

  return (
    <section
      aria-labelledby="titulo-principal"
      className="on-night relative overflow-hidden bg-night text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_55%,rgb(67_86_255/0.35),transparent_70%)]"
      />
      <Container className="relative grid items-center gap-6 pt-12 pb-0 lg:min-h-[34rem] lg:grid-cols-2 lg:py-16">
        <div className="animate-rise">
          <p className="text-sm font-medium text-night-muted">{slogan}</p>
          <h1
            id="titulo-principal"
            className="mt-3 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
          >
            Tu próximo celular, a un mensaje de distancia.
          </h1>
          <p className="mt-5 max-w-md text-base text-night-muted sm:text-lg">
            Explora el catálogo, revisa la disponibilidad y escríbenos directamente por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/catalogo" variant="inverse" size="lg">
              Ver catálogo
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </div>

        <div aria-hidden className="relative mx-auto h-64 w-full max-w-md sm:h-80 lg:h-[28rem]">
          <ProductArt
            kind="phone"
            view="back"
            tone="#5c6a99"
            className="absolute top-10 left-[-8%] h-[100%] -rotate-[8deg] lg:top-12"
          />
          <ProductArt
            kind="phone"
            tone="#6d7184"
            className="absolute top-0 right-[-8%] h-[108%] rotate-[5deg] motion-safe:animate-float"
          />
        </div>
      </Container>
    </section>
  );
}
