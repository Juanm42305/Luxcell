/**
 * Dirección secreta del panel. Se define solo en el servidor con ADMIN_ACCESS_PATH (nunca con
 * prefijo NEXT_PUBLIC_). Sin un valor válido el panel queda desactivado por completo.
 * Ocultar la ruta evita los robots que buscan paneles; la seguridad real la dan la contraseña,
 * el segundo factor y las políticas RLS.
 */
const ACCESS_PATH_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export function getAdminBase(): string | null {
  const value = process.env.ADMIN_ACCESS_PATH;
  return value && ACCESS_PATH_PATTERN.test(value) ? `/${value}` : null;
}

/** Ruta pública del panel. `subpath` es "" para el resumen o empieza por "/". */
export function adminHref(subpath = ""): string {
  const base = getAdminBase();
  if (!base) throw new Error("El panel administrativo no está configurado");
  return `${base}${subpath}`;
}

export function isInternalAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
