import {
  BadgeCheck,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TabletSmartphone,
  Eye,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { buildGeneralMessage } from "@/lib/whatsapp";
import { getBusinessSettings } from "@/services/settings";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "LUX CELL: celulares iPhone, Android y accesorios tecnológicos en Montería, Córdoba. Atención personalizada e información clara.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Confianza",
    text: "Queremos que cada cliente compre con tranquilidad.",
  },
  {
    icon: Handshake,
    title: "Honestidad",
    text: "Te asesoramos para que encuentres lo que de verdad necesitas.",
  },
  {
    icon: Eye,
    title: "Transparencia",
    text: "Información clara sobre cada producto, antes de comprar.",
  },
];

const offerings = [
  { icon: Smartphone, text: "iPhone y dispositivos Apple." },
  { icon: TabletSmartphone, text: "Celulares Android de diferentes marcas." },
  { icon: Headphones, text: "Accesorios tecnológicos." },
  { icon: Handshake, text: "Atención personalizada y asesoría." },
  { icon: BadgeCheck, text: "Información clara y transparente sobre nuestros productos." },
];

export default async function AboutPage() {
  const settings = await getBusinessSettings();

  return (
    <>
      <section
        aria-labelledby="titulo-nosotros"
        className="on-night relative overflow-hidden bg-night text-white"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(55%_65%_at_80%_40%,rgb(255_220_8/0.14),transparent_70%)]"
        />
        <Container className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
          <div className="animate-rise">
            <p className="text-sm font-semibold tracking-wide text-brand uppercase">
              Sobre nosotros
            </p>
            <h1
              id="titulo-nosotros"
              className="mt-3 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl"
            >
              ¡Bienvenido a {settings.name}!
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">
              Somos un negocio dedicado a la comercialización de celulares iPhone, dispositivos
              Android y accesorios tecnológicos, comprometidos con ofrecer productos de calidad y
              una experiencia de compra basada en la confianza, la honestidad y la transparencia.
            </p>
          </div>
          <div className="mx-auto">
            <Image
              src="/brand/luxcell-emblema.webp"
              alt={`Logo de ${settings.name}`}
              width={320}
              height={320}
              priority
              className="size-48 drop-shadow-[0_0_60px_rgb(255_220_8/0.25)] sm:size-64"
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="titulo-prioridad" className="reveal py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 id="titulo-prioridad" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Comprar con tranquilidad
            </h2>
            <div className="mt-5 space-y-4 text-lg text-ink-soft">
              <p>
                Nuestra prioridad es que cada cliente compre con tranquilidad, reciba información
                clara y encuentre el dispositivo o accesorio que mejor se adapte a sus necesidades.
              </p>
              <p>
                En {settings.name} creemos que una buena compra comienza con una buena atención. Por
                eso, trabajamos para construir relaciones duraderas con nuestros clientes, brindando
                asesoría personalizada, comunicación transparente y un servicio cercano en Montería,
                Córdoba.
              </p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {values.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex gap-4 rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-ink/30"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-night text-brand">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-sm text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        aria-labelledby="titulo-encontraras"
        className="reveal border-y border-line bg-surface py-14 sm:py-20"
      >
        <Container>
          <h2 id="titulo-encontraras" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            ¿Qué encontrarás en {settings.name}?
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {offerings.map(({ icon: Icon, text }) => (
              <li key={text} className="rounded-3xl border border-line bg-paper p-5">
                <Icon aria-hidden className="size-7 text-brand-ink" />
                <p className="mt-4 font-medium text-balance">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href="/catalogo" variant="primary" size="lg">
              Ver el catálogo
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="titulo-contacto" className="reveal py-14 sm:py-20">
        <Container>
          <div className="on-night grid gap-10 overflow-hidden rounded-[2rem] bg-night p-6 text-white sm:p-10 lg:grid-cols-2 lg:p-14">
            <div>
              <h2
                id="titulo-contacto"
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                ¡Conéctate con nosotros!
              </h2>
              <ul className="mt-8 space-y-4">
                <li className="flex items-center gap-3">
                  <MapPin aria-hidden className="size-5 shrink-0 text-brand" />
                  <span>Montería, Córdoba, Colombia.</span>
                </li>
                {settings.phone && (
                  <li className="flex items-center gap-3">
                    <MessageCircle aria-hidden className="size-5 shrink-0 text-brand" />
                    <span>WhatsApp: {settings.phone}</span>
                  </li>
                )}
                {settings.contactEmail && (
                  <li className="flex items-center gap-3">
                    <Mail aria-hidden className="size-5 shrink-0 text-brand" />
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="break-all underline-offset-2 hover:text-brand hover:underline"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <WhatsAppLink
                  phoneNumber={settings.whatsappNumber}
                  message={buildGeneralMessage()}
                  label="Escríbenos por WhatsApp"
                  size="lg"
                />
                {settings.socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-start justify-center border-t border-night-line pt-10 lg:items-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 lg:text-right">
              <Sparkles aria-hidden className="size-8 text-brand" />
              <p className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {settings.name}
              </p>
              <p className="mt-2 text-xl font-semibold text-brand sm:text-2xl">
                Tu tecnología, nuestra confianza.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
