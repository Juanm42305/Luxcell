"use server";

import { z } from "zod";
import { brandSchema, categorySchema, formToObject, toFieldErrors } from "@/schemas/admin";
import { requireAdmin } from "@/services/admin-session";
import { invalidateCatalog } from "../invalidate";
import { type ActionState, databaseErrorMessage } from "../action-state";

const invalid = (error: z.ZodError): ActionState => ({
  status: "error",
  message: "Revisa los campos marcados.",
  fieldErrors: toFieldErrors(error),
});

/** `id` vacío crea una categoría nueva; con valor, la actualiza. */
export async function saveCategory(
  id: string | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (id !== null && !z.uuid().safeParse(id).success)
    return { status: "error", message: "Categoría no válida." };

  const parsed = categorySchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const row = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    display_order: parsed.data.displayOrder,
    is_active: parsed.data.isActive,
  };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  invalidateCatalog();
  return { status: "success", message: id ? "Categoría guardada." : "Categoría creada." };
}

export async function deleteCategory(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { status: "error", message: "Categoría no válida." };
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };
  invalidateCatalog();
  return { status: "success", message: "Categoría eliminada." };
}

export async function saveBrand(
  id: string | null,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (id !== null && !z.uuid().safeParse(id).success)
    return { status: "error", message: "Marca no válida." };

  const parsed = brandSchema.safeParse(formToObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const row = { name: parsed.data.name, slug: parsed.data.slug, is_active: parsed.data.isActive };
  const { error } = id
    ? await supabase.from("brands").update(row).eq("id", id)
    : await supabase.from("brands").insert(row);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };

  invalidateCatalog();
  return { status: "success", message: id ? "Marca guardada." : "Marca creada." };
}

export async function deleteBrand(id: string): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { status: "error", message: "Marca no válida." };
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { status: "error", message: databaseErrorMessage(error.code) };
  invalidateCatalog();
  return { status: "success", message: "Marca eliminada." };
}
