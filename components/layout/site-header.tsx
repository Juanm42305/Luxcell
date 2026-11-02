import Link from "next/link";
import { navLinks } from "@/config/site";
import { Container } from "@/components/ui/container";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { buildGeneralMessage } from "@/lib/whatsapp";
import { getBusinessSettings } from "@/services/settings";
import { BrandMark } from "./brand-mark";
import { SiteSearch } from "./site-search";

export async function SiteHeader() {
  const { whatsappNumber } = await getBusinessSettings();

  return (
    <header className="on-night sticky top-0 z-40 border-b border-night-line bg-night/95 text-white backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <BrandMark />
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-full px-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SiteSearch
          id="busqueda-cabecera"
          tone="dark"
          className="hidden flex-1 md:block lg:ml-auto lg:max-w-xs"
        />
        <div className="ml-auto hidden shrink-0 md:block lg:ml-0">
          <WhatsAppLink
            phoneNumber={whatsappNumber}
            message={buildGeneralMessage()}
            label="Escríbenos"
          />
        </div>
      </Container>
    </header>
  );
}
