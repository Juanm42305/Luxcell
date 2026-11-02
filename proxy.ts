import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminBase, isInternalAdminPath } from "@/lib/admin-path";
import { getAdminRedirect } from "@/lib/security/admin-routes";
import { buildContentSecurityPolicy } from "@/lib/security/csp";
import { authCookieOptions, getSupabaseConfig } from "@/lib/supabase/config";

const NOT_FOUND_PATH = "/__no-encontrado";

export async function proxy(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy(nonce, url);
  const { pathname, search } = request.nextUrl;

  const forwardHeaders = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("content-security-policy", csp);
    return headers;
  };

  const finish = (response: NextResponse) => {
    response.headers.set("Content-Security-Policy", csp);
    return response;
  };

  // La ruta interna nunca se sirve directamente: responde igual que una página inexistente.
  if (isInternalAdminPath(pathname)) {
    return finish(
      NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url), {
        request: { headers: forwardHeaders() },
      }),
    );
  }

  const adminBase = getAdminBase();
  const isAdminRequest =
    adminBase !== null && (pathname === adminBase || pathname.startsWith(`${adminBase}/`));

  if (!isAdminRequest) {
    return finish(NextResponse.next({ request: { headers: forwardHeaders() } }));
  }

  const subpath = pathname.slice(adminBase.length) || "/";
  const internalUrl = new URL(`/admin${subpath === "/" ? "" : subpath}${search}`, request.url);
  const forward = () =>
    NextResponse.rewrite(internalUrl, { request: { headers: forwardHeaders() } });

  let response = forward();
  const supabase = createServerClient(url, publishableKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = forward();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims verifica la firma del token; getSession no es confiable en el servidor.
  const { data } = await supabase.auth.getClaims();
  const target = getAdminRedirect(subpath, {
    hasSession: Boolean(data?.claims),
    aal: (data?.claims?.aal as string | undefined) ?? null,
  });

  if (target) {
    const redirect = NextResponse.redirect(new URL(`${adminBase}${target}`, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    response = redirect;
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return finish(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon\\.png|apple-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|webp|avif|mp4)$).*)",
  ],
};
