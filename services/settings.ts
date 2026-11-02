import "server-only";
import { cache } from "react";
import { fallbackBusinessName } from "@/config/site";
import { createPublicClient } from "@/lib/supabase/public";
import { parseBrandColor, parseSocialLinks } from "@/schemas/business-settings";

/** Una sola consulta por petición, aunque varios componentes pidan la configuración. */
export const getBusinessSettings = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("business_settings").select("*").maybeSingle();

  if (error) {
    console.error("No se pudo leer business_settings", error.code);
    throw new Error("No se pudo cargar la configuración del negocio");
  }

  // Sin un canal de contacto completo el sitio no se indexa y muestra el aviso de preparación.
  const isComplete = Boolean(
    data?.business_name && data.whatsapp_number && data.phone && data.contact_email,
  );

  // Los datos ausentes quedan en null y no se muestran: nunca se inventa un valor.
  return {
    name: data?.business_name ?? fallbackBusinessName,
    slogan: data?.slogan ?? null,
    description: data?.description ?? null,
    logoUrl: data?.logo_path
      ? supabase.storage.from("business-assets").getPublicUrl(data.logo_path).data.publicUrl
      : null,
    whatsappNumber: data?.whatsapp_number ?? null,
    contactEmail: data?.contact_email ?? null,
    phone: data?.phone ?? null,
    commercialAddress: data?.business_address ?? null,
    legalName: data?.legal_name ?? null,
    taxId: data?.tax_id ?? null,
    judicialAddress: data?.judicial_address ?? null,
    salesAuthorization: data?.sales_authorization ?? null,
    socialLinks: parseSocialLinks(data?.social_media),
    brandColor: parseBrandColor(data?.brand_colors),
    isComplete,
  };
});

export type BusinessSettings = Awaited<ReturnType<typeof getBusinessSettings>>;
