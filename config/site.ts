/** Logo por defecto (versión horizontal). Se reemplaza si `business_settings.logo_path` tiene valor. */
export const defaultLogo = { src: "/brand/luxcell-logo.webp", width: 362, height: 96 };

export const fallbackBusinessName = "LUX CELL";

/**
 * Video de fondo del banner principal, servido desde public/video. En null se muestra la
 * ilustración. Solo usar videos propios o con licencia de uso comercial.
 */
export const heroVideo: { src: string; poster: string } | null = {
  src: "/video/banner.mp4",
  poster: "/video/banner-poster.webp",
};

export const siteDescription =
  "Celulares, accesorios y tecnología en LUX CELL. Consulta disponibilidad y escríbenos por WhatsApp.";

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#negocio", label: "Nosotros" },
];

export const legalLinks = [
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/datos-personales", label: "Tratamiento de datos personales" },
  { href: "/legal/privacidad", label: "Aviso de privacidad" },
  { href: "/legal/cookies", label: "Política de cookies" },
];
