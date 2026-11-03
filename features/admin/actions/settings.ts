"use server";

import { ImageRejectedError, processImage } from "@/lib/images/process";
import { formToObject, settingsSchema, toFieldErrors, uploadPathSchema } from "@/schemas/admin";
import { requireAdmin } from "@/services/admin-session";
import { invalidateCatalog } from "../invalidate";
import { type ActionState, databaseErrorMessage } from "../action-state";

export async function saveSettings(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  const input = parsed.data;

  const { error } = await supabase
    .from("business_settings")
    .update({
      business_name: input.businessName,
      slogan: input.slogan,
      description: input.description,
      whatsapp_number: input.whatsappNumber,
      contact_email: input.contactEmail,
      phone: input.phone,
      business_address: input.businessAddress,
      legal_name: input.legalName,
      tax_id: input.taxId,
      judicial_address: input.judicialAddress,
      sales_authorization: input.salesAuthorization,
      social_media: input.socialLinks,
      brand_colors: { primary: input.brandColor.toUpperCase() },
    })
    .eq("id", true);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  invalidateCatalog();
  return { status: "success", message: "Configuración guardada." };
}

/** Mismo circuito que las fotos de producto: cuarentena, validación y reconversión. */
export async function publishLogo(quarantinePath: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const path = uploadPathSchema.safeParse(quarantinePath);
  if (!path.success) return { status: "error", message: "Archivo no válido." };

  try {
    const { data: file } = await supabase.storage.from("uploads-quarantine").download(path.data);
    if (!file) return { status: "error", message: "No se encontró el archivo subido." };

    const webp = await processImage(await file.arrayBuffer(), { maxWidth: 800, maxHeight: 240 });
    const logoPath = `logo/${crypto.randomUUID()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("business-assets")
      .upload(logoPath, webp, { contentType: "image/webp", upsert: false });
    if (uploadError) return { status: "error", message: "No se pudo publicar el logo." };

    const { data: previous } = await supabase
      .from("business_settings")
      .select("logo_path")
      .single();
    const { error } = await supabase
      .from("business_settings")
      .update({ logo_path: logoPath })
      .eq("id", true);
    if (error) return { status: "error", message: databaseErrorMessage(error.code) };
    if (previous?.logo_path)
      await supabase.storage.from("business-assets").remove([previous.logo_path]);

    invalidateCatalog();
    return { status: "success", message: "Logo actualizado." };
  } catch (error) {
    if (error instanceof ImageRejectedError) return { status: "error", message: error.message };
    return { status: "error", message: "No se pudo procesar el logo." };
  } finally {
    await supabase.storage.from("uploads-quarantine").remove([path.data]);
  }
}

export async function removeLogo(): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const { data: previous } = await supabase.from("business_settings").select("logo_path").single();
  const { error } = await supabase
    .from("business_settings")
    .update({ logo_path: null })
    .eq("id", true);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };
  if (previous?.logo_path)
    await supabase.storage.from("business-assets").remove([previous.logo_path]);
  invalidateCatalog();
  return { status: "success", message: "Se usa de nuevo el logo predeterminado." };
}
