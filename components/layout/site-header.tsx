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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <BrandMark className="max-w-[60%] shrink-0 lg:max-w-56" />
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-full px-3 text-sm text-ink-soft transition-colors hover:bg-ink/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <SiteSearch
          id="busqueda-cabecera"
          className="hidden flex-1 md:block lg:max-w-xs lg:ml-auto"
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
