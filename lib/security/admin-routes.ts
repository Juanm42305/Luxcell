const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/recuperar"];
const SECOND_FACTOR_EXEMPT_PATHS = ["/admin/mfa", "/admin/nueva-contrasena"];

/** Decide a dónde debe ir cada petición a /admin. Devuelve null si puede continuar. */
export function getAdminRedirect(
  pathname: string,
  session: { hasSession: boolean; aal: string | null },
): string | null {
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return null;
  if (!session.hasSession) return "/admin/login";
  if (session.aal !== "aal2" && !SECOND_FACTOR_EXEMPT_PATHS.includes(pathname)) {
    return "/admin/mfa";
  }
  return null;
}
