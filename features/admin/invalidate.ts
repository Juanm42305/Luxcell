import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/cache-tags";

/**
 * Tras cualquier cambio en el panel: vacía la caché de datos públicos al instante (la web muestra
 * lo nuevo en la siguiente visita) y refresca las páginas ya renderizadas.
 */
export function invalidateCatalog() {
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}
