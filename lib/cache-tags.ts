/** Etiqueta de caché de todo lo público: catálogo, categorías, marcas y datos del negocio. */
export const CATALOG_TAG = "catalogo";

export const CATALOG_CACHE = {
  /** Respaldo por si alguien edita la base directamente (SQL Editor) sin pasar por el panel. */
  revalidateSeconds: 300,
};
