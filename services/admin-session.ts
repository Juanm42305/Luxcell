import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";

/**
 * Segunda barrera tras el proxy; la tercera son las políticas RLS. Se invoca en cada página y
 * acción del panel. La sesión sin perfil de administrador se trata igual que no tener sesión.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) redirect("/admin/login");
  if (claims.aal !== "aal2") redirect("/admin/mfa");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("role")
    .eq("auth_user_id", claims.sub)
    .maybeSingle();

  if (!profile) redirect("/admin/login");

  return { supabase, userId: claims.sub, email: claims.email };
});
