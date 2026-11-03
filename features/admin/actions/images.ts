"use server";

import { z } from "zod";
import { ImageRejectedError, processImage } from "@/lib/images/process";
import { uploadPathSchema } from "@/schemas/admin";
import { requireAdmin } from "@/services/admin-session";
import { invalidateCatalog } from "../invalidate";
import type { ActionState } from "../action-state";

const QUARANTINE = "uploads-quarantine";
const PUBLIC_BUCKET = "product-images";

/**
 * El navegador sube el archivo original al bucket privado de cuarentena (solo un admin con MFA
 * puede hacerlo). Aquí el servidor lo descarga, lo valida, lo reconvierte y solo entonces lo
 * publica. El original se elimina siempre, aunque falle la validación.
 */
export async function publishProductImage(
  productId: string,
  altText: string,
  quarantinePath: string,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const ids = z
    .object({ productId: z.uuid(), path: uploadPathSchema, alt: z.string().trim().min(1).max(200) })
    .safeParse({ productId, path: quarantinePath, alt: altText });
  if (!ids.success) return { status: "error", message: "Datos de la imagen no válidos." };

  try {
    const { data: file, error: downloadError } = await supabase.storage
      .from(QUARANTINE)
      .download(ids.data.path);
    if (downloadError || !file)
      return { status: "error", message: "No se encontró el archivo subido." };

    const webp = await processImage(await file.arrayBuffer(), { maxWidth: 1600, maxHeight: 1600 });
    const storagePath = `${ids.data.productId}/${crypto.randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(PUBLIC_BUCKET)
      .upload(storagePath, webp, { contentType: "image/webp", upsert: false });
    if (uploadError) return { status: "error", message: "No se pudo publicar la imagen." };

    const { data: existing } = await supabase
      .from("product_images")
      .select("display_order, is_primary")
      .eq("product_id", ids.data.productId);
    const nextOrder = Math.max(-1, ...(existing ?? []).map((image) => image.display_order)) + 1;
    const hasPrimary = (existing ?? []).some((image) => image.is_primary);

    const { error: insertError } = await supabase.from("product_images").insert({
      product_id: ids.data.productId,
      storage_path: storagePath,
      alt_text: ids.data.alt,
      is_primary: !hasPrimary,
      display_order: nextOrder,
    });
    if (insertError) {
      await supabase.storage.from(PUBLIC_BUCKET).remove([storagePath]);
      return { status: "error", message: "No se pudo registrar la imagen." };
    }

    invalidateCatalog();
    return { status: "success", message: "Imagen publicada." };
  } catch (error) {
    if (error instanceof ImageRejectedError) return { status: "error", message: error.message };
    console.error("Error al procesar imagen");
    return { status: "error", message: "No se pudo procesar la imagen." };
  } finally {
    await supabase.storage.from(QUARANTINE).remove([ids.data.path]);
  }
}

async function getOwnedImage(imageId: string) {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(imageId).success) return { supabase, image: null };
  const { data: image } = await supabase
    .from("product_images")
    .select("id, product_id, storage_path, is_primary, display_order")
    .eq("id", imageId)
    .maybeSingle();
  return { supabase, image };
}

export async function setPrimaryImage(imageId: string): Promise<ActionState> {
  const { supabase, image } = await getOwnedImage(imageId);
  if (!image) return { status: "error", message: "Imagen no encontrada." };

  // Primero se desmarca la anterior: solo puede haber una principal por producto.
  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", image.product_id)
    .eq("is_primary", true);
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", image.id);
  if (error) return { status: "error", message: "No se pudo cambiar la foto principal." };

  invalidateCatalog();
  return { status: "success" };
}

export async function moveImage(imageId: string, direction: "up" | "down"): Promise<ActionState> {
  const { supabase, image } = await getOwnedImage(imageId);
  if (!image || (direction !== "up" && direction !== "down")) {
    return { status: "error", message: "Imagen no encontrada." };
  }

  const { data: siblings } = await supabase
    .from("product_images")
    .select("id, display_order")
    .eq("product_id", image.product_id)
    .order("display_order");
  const list = siblings ?? [];
  const index = list.findIndex((item) => item.id === image.id);
  const swapWith = list[direction === "up" ? index - 1 : index + 1];
  if (!swapWith) return { status: "success" };

  // Se renumeran todas para evitar órdenes repetidos.
  const reordered = [...list];
  const otherIndex = reordered.indexOf(swapWith);
  [reordered[index], reordered[otherIndex]] = [reordered[otherIndex]!, reordered[index]!];
  await Promise.all(
    reordered.map((item, order) =>
      supabase.from("product_images").update({ display_order: order }).eq("id", item.id),
    ),
  );

  invalidateCatalog();
  return { status: "success" };
}

export async function updateImageAlt(imageId: string, altText: string): Promise<ActionState> {
  const { supabase, image } = await getOwnedImage(imageId);
  const alt = z.string().trim().min(1).max(200).safeParse(altText);
  if (!image || !alt.success)
    return { status: "error", message: "Descripción no válida (1 a 200 caracteres)." };

  const { error } = await supabase
    .from("product_images")
    .update({ alt_text: alt.data })
    .eq("id", image.id);
  if (error) return { status: "error", message: "No se pudo guardar la descripción." };
  invalidateCatalog();
  return { status: "success", message: "Descripción guardada." };
}

export async function deleteImage(imageId: string): Promise<ActionState> {
  const { supabase, image } = await getOwnedImage(imageId);
  if (!image) return { status: "error", message: "Imagen no encontrada." };

  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) return { status: "error", message: "No se pudo eliminar la imagen." };
  await supabase.storage.from(PUBLIC_BUCKET).remove([image.storage_path]);

  // Si era la principal, la siguiente pasa a serlo.
  if (image.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("display_order")
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from("product_images").update({ is_primary: true }).eq("id", next.id);
  }

  invalidateCatalog();
  return { status: "success" };
}
