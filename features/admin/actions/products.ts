"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminHref } from "@/lib/admin-path";
import {
  formToObject,
  newProductSchema,
  productSchema,
  stockSchema,
  toFieldErrors,
} from "@/schemas/admin";
import { requireAdmin } from "@/services/admin-session";
import { type ActionState, databaseErrorMessage } from "../action-state";

type ProductInput = z.infer<typeof productSchema>;

function toRow(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    model: input.model,
    brand_id: input.brandId,
    category_id: input.categoryId,
    short_description: input.shortDescription,
    description: input.description,
    price: input.price,
    low_stock_threshold: input.lowStockThreshold,
    condition: input.condition,
    storage_capacity: input.storageCapacity,
    color: input.color,
    specs: input.specs,
    warranty_terms: input.warrantyTerms,
    offer_valid_until: input.offerValidUntil,
    is_featured: input.isFeatured,
    is_active: input.isActive,
  };
}

export async function createProduct(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const parsed = newProductSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...toRow(parsed.data), stock_quantity: parsed.data.initialStock })
    .select("id")
    .single();

  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  revalidatePath("/", "layout");
  redirect(adminHref(`/productos/${data.id}?creado=1`));
}

export async function updateProduct(
  productId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(productId).success)
    return { status: "error", message: "Producto no válido." };

  const parsed = productSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const { error } = await supabase.from("products").update(toRow(parsed.data)).eq("id", productId);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  revalidatePath("/", "layout");
  return { status: "success", message: "Producto guardado." };
}

export async function updateStock(
  productId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(productId).success)
    return { status: "error", message: "Producto no válido." };

  const parsed = stockSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  // Única vía para cambiar existencias: la función registra el movimiento en el historial.
  const { error } = await supabase.rpc("set_stock_quantity", {
    p_product_id: productId,
    p_quantity: parsed.data.quantity,
    p_reason: parsed.data.reason ?? undefined,
  });
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  revalidatePath("/", "layout");
  return { status: "success", message: "Existencias actualizadas." };
}

export async function deleteProduct(productId: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(productId).success)
    return { status: "error", message: "Producto no válido." };

  const { data: images } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("product_id", productId);

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  // Las filas de imágenes se borran en cascada; los archivos hay que quitarlos de Storage.
  if (images && images.length > 0) {
    await supabase.storage.from("product-images").remove(images.map((image) => image.storage_path));
  }

  revalidatePath("/", "layout");
  redirect(adminHref("/productos?eliminado=1"));
}
