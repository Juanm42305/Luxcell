import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { heroVideo } from "@/config/site";
import { cn } from "@/lib/cn";
import { getBusinessSettings } from "@/services/settings";
import { HeroVideo } from "./hero-video";
import { ProductArt } from "./product-art";

export async function Hero() {
  const { slogan, description } = await getBusinessSettings();
  const eyebrow = slogan ?? description;

  return (
    <section
      aria-labelledby="titulo-principal"
      className="on-night relative overflow-hidden bg-night text-white"
    >
      {heroVideo ? (
        <HeroVideo src={heroVideo.src} poster={heroVideo.poster} />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_70%_at_75%_55%,rgb(255_220_8/0.16),transparent_70%)]"
        />
      )}
      <Container
        className={cn(
          "relative grid items-center gap-6 lg:grid-cols-2",
          heroVideo
            ? "min-h-[34rem] py-16 sm:min-h-[38rem] lg:min-h-[40rem]"
            : "pt-12 pb-0 lg:min-h-[34rem] lg:py-16",
        )}
      >
        <div className="animate-rise">
          {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand">{eyebrow}</p>}
          <h1
            id="titulo-principal"
            className="mt-3 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
          >
            Tu próximo celular, a un mensaje de distancia.
          </h1>
          <p className="mt-5 max-w-md text-base text-white/80 sm:text-lg">
            Explora el catálogo, revisa la disponibilidad y escríbenos directamente por WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/catalogo" variant="accent" size="lg">
              Ver catálogo
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </div>

        {!heroVideo && (
          <div aria-hidden className="relative mx-auto h-64 w-full max-w-md sm:h-80 lg:h-[28rem]">
            <ProductArt
              kind="phone"
              view="back"
              tone="#c9a40a"
              className="absolute top-10 left-[-8%] h-[100%] -rotate-[8deg] lg:top-12"
            />
            <ProductArt
              kind="phone"
              tone="#3a3a3a"
              className="absolute top-0 right-[-8%] h-[108%] rotate-[5deg] motion-safe:animate-float"
            />
          </div>
        )}
      </Container>
    </section>
  );
}
