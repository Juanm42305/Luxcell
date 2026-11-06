"use server";

import { z } from "zod";
import { toExactPattern } from "@/lib/search";
import { brandSchema, categorySchema, formToObject, toFieldErrors } from "@/schemas/admin";
import { requireAdmin } from "@/services/admin-session";
import { invalidateCatalog } from "../invalidate";
import { type ActionState, databaseErrorMessage } from "../action-state";

const invalid = (error: z.ZodError): ActionState => ({
  status: "error",
  message: "Revisa los campos marcados.",
  fieldErrors: toFieldErrors(error),
});

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

/**
 * La base de datos ya impide repetir el identificador; esto impide además «Apple» y «APPLE»,
 * que tendrían identificadores distintos si se edita el slug a mano.
 */
async function nameTaken(
  supabase: AdminClient,
  table: "brands" | "categories",
  name: string,
  exceptId: string | null,
): Promise<boolean> {
  let query = supabase.from(table).select("id").ilike("name", toExactPattern(name)).limit(1);
  if (exceptId) query = query.neq("id", exceptId);
  const { data } = await query;
  return Boolean(data && data.length > 0);
}

const duplicated = (label: string, name: string): ActionState => ({
  status: "error",
  message: `Ya existe ${label} «${name}».`,
  fieldErrors: { name: "Este nombre ya existe." },
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
  if (await nameTaken(supabase, "categories", parsed.data.name, id))
    return duplicated("una categoría llamada", parsed.data.name);

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
  if (await nameTaken(supabase, "brands", parsed.data.name, id))
    return duplicated("una marca llamada", parsed.data.name);

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
