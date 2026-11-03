import { Container } from "@/components/ui/container";
import { WhatsAppLink } from "@/features/inquiries/components/whatsapp-link";
import { buildGeneralMessage } from "@/lib/whatsapp";
import { getBusinessSettings } from "@/services/settings";
import { BrandMark } from "./brand-mark";
import { HeaderNav } from "./header-nav";
import { SiteSearch } from "./site-search";

export async function SiteHeader() {
  const { whatsappNumber } = await getBusinessSettings();

  return (
    <header className="on-night header-scroll sticky top-0 z-40 border-b border-night-line bg-night/95 text-white backdrop-blur-xl">
      <Container className="flex h-16 items-center gap-4 lg:gap-8">
        <BrandMark />
        <HeaderNav />
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
