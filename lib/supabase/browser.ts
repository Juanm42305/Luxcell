import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { authCookieOptions } from "./config";

/**
 * El inicio de sesión se hace desde el navegador a propósito: así Supabase limita los intentos por
 * la IP real del visitante, no por la IP compartida de los servidores de Vercel.
 */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: authCookieOptions },
  );
}
