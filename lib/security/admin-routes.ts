const PUBLIC_ADMIN_PATHS = ["/login", "/recuperar"];
const SECOND_FACTOR_EXEMPT_PATHS = ["/mfa", "/nueva-contrasena"];

/**
 * Decide a dónde debe ir cada petición al panel. `subpath` es la ruta dentro del panel ("/" para
 * el resumen). Devuelve otra subruta, o null si puede continuar.
 */
export function getAdminRedirect(
  subpath: string,
  session: { hasSession: boolean; aal: string | null },
): string | null {
  if (PUBLIC_ADMIN_PATHS.includes(subpath)) return null;
  if (!session.hasSession) return "/login";
  if (session.aal !== "aal2" && !SECOND_FACTOR_EXEMPT_PATHS.includes(subpath)) return "/mfa";
  return null;
}
