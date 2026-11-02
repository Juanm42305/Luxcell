import "server-only";
import { cache } from "react";
import { businessPlaceholders } from "@/config/site";
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

  // Sin todos los datos de identificación del proveedor, el sitio no se indexa ni se da por listo.
  const isComplete = Boolean(
    data?.business_name &&
    data.legal_name &&
    data.tax_id &&
    data.judicial_address &&
    data.phone &&
    data.contact_email &&
    data.whatsapp_number &&
    data.sales_authorization,
  );

  return {
    name: data?.business_name ?? businessPlaceholders.name,
    slogan: data?.slogan ?? businessPlaceholders.slogan,
    description: data?.description ?? businessPlaceholders.description,
    logoUrl: data?.logo_path
      ? supabase.storage.from("business-assets").getPublicUrl(data.logo_path).data.publicUrl
      : null,
    whatsappNumber: data?.whatsapp_number ?? null,
    contactEmail: data?.contact_email ?? businessPlaceholders.contactEmail,
    phone: data?.phone ?? businessPlaceholders.phone,
    commercialAddress: data?.business_address ?? businessPlaceholders.commercialAddress,
    legalName: data?.legal_name ?? businessPlaceholders.legalName,
    taxId: data?.tax_id ?? businessPlaceholders.taxId,
    judicialAddress: data?.judicial_address ?? businessPlaceholders.judicialAddress,
    salesAuthorization: data?.sales_authorization ?? businessPlaceholders.salesAuthorization,
    socialLinks: parseSocialLinks(data?.social_media),
    brandColor: parseBrandColor(data?.brand_colors),
    isComplete,
  };
});
