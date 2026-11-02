/**
 * Marcadores que se muestran mientras el negocio no complete `business_settings`.
 * Todo valor entre corchetes es un dato pendiente, no información real.
 */
export const businessPlaceholders = {
  name: "[Nombre comercial]",
  slogan: "[Eslogan del negocio]",
  description: "[Descripción del negocio: la entrega el negocio]",
  contactEmail: "[Correo de atención]",
  phone: "[Teléfono]",
  commercialAddress: "[Dirección comercial]",
  legalName: "[Nombre o razón social]",
  taxId: "[NIT]",
  judicialAddress: "[Dirección de notificación judicial]",
  salesAuthorization: "[Número de autorización de venta de equipos móviles]",
};

export const siteDescription =
  "Catálogo de celulares y accesorios tecnológicos con contacto directo por WhatsApp.";

export const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/#negocio", label: "El negocio" },
];

export const legalLinks = [
  { href: "/legal/terminos", label: "Términos y condiciones" },
  { href: "/legal/datos-personales", label: "Tratamiento de datos personales" },
  { href: "/legal/privacidad", label: "Aviso de privacidad" },
  { href: "/legal/cookies", label: "Política de cookies" },
];
