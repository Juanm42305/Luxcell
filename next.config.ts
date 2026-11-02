import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// La Content-Security-Policy se añade en proxy.ts porque cada respuesta lleva su propio nonce.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: new URL(supabaseUrl).protocol === "https:" ? "https" : "http",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
    // Solo cuando Supabase corre en este mismo equipo (desarrollo y pruebas locales).
    dangerouslyAllowLocalIP: Boolean(
      supabaseUrl && ["127.0.0.1", "localhost"].includes(new URL(supabaseUrl).hostname),
    ),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
