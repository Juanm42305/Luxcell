import type { CSSProperties, ReactNode } from "react";
import { DemoBanner } from "@/components/layout/demo-banner";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getBusinessSettings } from "@/services/settings";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const { whatsappNumber, brandColor } = await getBusinessSettings();
  const brandStyle = brandColor ? ({ "--brand": brandColor } as CSSProperties) : undefined;

  return (
    <div
      style={brandStyle}
      className="flex min-h-dvh flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"
    >
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <MobileNav whatsappNumber={whatsappNumber} />
    </div>
  );
}
