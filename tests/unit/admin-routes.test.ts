import { afterEach, describe, expect, it, vi } from "vitest";
import { adminHref, getAdminBase, isInternalAdminPath } from "@/lib/admin-path";
import { getAdminRedirect } from "@/lib/security/admin-routes";

const anonymous = { hasSession: false, aal: null };
const passwordOnly = { hasSession: true, aal: "aal1" };
const secondFactor = { hasSession: true, aal: "aal2" };

describe("protección de rutas administrativas", () => {
  it("envía al login a quien no tiene sesión", () => {
    expect(getAdminRedirect("/", anonymous)).toBe("/login");
    expect(getAdminRedirect("/mfa", anonymous)).toBe("/login");
    expect(getAdminRedirect("/nueva-contrasena", anonymous)).toBe("/login");
    expect(getAdminRedirect("/productos", anonymous)).toBe("/login");
  });

  it("exige segundo factor para entrar al panel", () => {
    expect(getAdminRedirect("/", passwordOnly)).toBe("/mfa");
    expect(getAdminRedirect("/productos/nuevo", passwordOnly)).toBe("/mfa");
  });

  it("permite el panel con segundo factor", () => {
    expect(getAdminRedirect("/", secondFactor)).toBeNull();
  });

  it("no bloquea las páginas de acceso", () => {
    expect(getAdminRedirect("/login", anonymous)).toBeNull();
    expect(getAdminRedirect("/recuperar", anonymous)).toBeNull();
    expect(getAdminRedirect("/mfa", passwordOnly)).toBeNull();
  });
});

describe("dirección secreta del panel", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sin configurar, el panel queda desactivado", () => {
    vi.stubEnv("ADMIN_ACCESS_PATH", "");
    expect(getAdminBase()).toBeNull();
    expect(() => adminHref()).toThrow();
  });

  it("rechaza valores cortos o con caracteres que alteren la ruta", () => {
    for (const value of [
      "corta",
      "../../etc/passwd-largo",
      "panel/con/barras-largas",
      "a b c d e f g h i j",
    ]) {
      vi.stubEnv("ADMIN_ACCESS_PATH", value);
      expect(getAdminBase()).toBeNull();
    }
  });

  it("construye las rutas con la dirección secreta", () => {
    vi.stubEnv("ADMIN_ACCESS_PATH", "panel-Prueba_1234567890");
    expect(adminHref("/login")).toBe("/panel-Prueba_1234567890/login");
  });

  it("reconoce la ruta interna, que nunca se sirve directamente", () => {
    expect(isInternalAdminPath("/admin")).toBe(true);
    expect(isInternalAdminPath("/admin/login")).toBe(true);
    expect(isInternalAdminPath("/administrador")).toBe(false);
  });
});
