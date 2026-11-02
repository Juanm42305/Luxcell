import { NextResponse } from "next/server";
import { getAdminBase } from "@/lib/admin-path";
import { createSessionClient } from "@/lib/supabase/server";

/** Enlace de recuperación de contraseña. El destino es fijo: no acepta redirecciones externas. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const adminBase = getAdminBase();

  if (code && adminBase) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`${adminBase}/nueva-contrasena`, origin));
  }

  return NextResponse.redirect(new URL(adminBase ? `${adminBase}/login` : "/", origin));
}
