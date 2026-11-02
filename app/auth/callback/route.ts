import { NextResponse } from "next/server";
import { getAdminBase } from "@/lib/admin-path";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Enlace de recuperación de contraseña. Solo un código válido lleva al panel: cualquier otro caso
 * va al inicio, para que esta ruta nunca revele la dirección secreta. Destinos fijos, sin
 * redirecciones abiertas.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const adminBase = getAdminBase();

  if (code && adminBase) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`${adminBase}/nueva-contrasena`, origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
