import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminRedirect } from "@/lib/security/admin-routes";
import { buildContentSecurityPolicy } from "@/lib/security/csp";
import { authCookieOptions, getSupabaseConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy(nonce, url);

  const continueRequest = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("content-security-policy", csp);
    return NextResponse.next({ request: { headers } });
  };

  let response = continueRequest();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const supabase = createServerClient(url, publishableKey, {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = continueRequest();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // getClaims verifica la firma del token; getSession no es confiable en el servidor.
    const { data } = await supabase.auth.getClaims();
    const target = getAdminRedirect(request.nextUrl.pathname, {
      hasSession: Boolean(data?.claims),
      aal: (data?.claims?.aal as string | undefined) ?? null,
    });

    if (target) {
      const redirect = NextResponse.redirect(new URL(target, request.url));
      response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      response = redirect;
    }
    response.headers.set("Cache-Control", "private, no-store");
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon\\.svg|.*\\.(?:svg|png|jpg|jpeg|webp|avif)$).*)"],
};
