import { describe, expect, it } from "vitest";
import { getAdminRedirect } from "@/lib/security/admin-routes";

const anonymous = { hasSession: false, aal: null };
const passwordOnly = { hasSession: true, aal: "aal1" };
const secondFactor = { hasSession: true, aal: "aal2" };

describe("protección de rutas administrativas", () => {
  it("envía al login a quien no tiene sesión", () => {
    expect(getAdminRedirect("/admin", anonymous)).toBe("/admin/login");
    expect(getAdminRedirect("/admin/mfa", anonymous)).toBe("/admin/login");
    expect(getAdminRedirect("/admin/nueva-contrasena", anonymous)).toBe("/admin/login");
    expect(getAdminRedirect("/admin/productos", anonymous)).toBe("/admin/login");
  });

  it("exige segundo factor para entrar al panel", () => {
    expect(getAdminRedirect("/admin", passwordOnly)).toBe("/admin/mfa");
    expect(getAdminRedirect("/admin/consultas", passwordOnly)).toBe("/admin/mfa");
  });

  it("permite el panel con segundo factor", () => {
    expect(getAdminRedirect("/admin", secondFactor)).toBeNull();
  });

  it("no bloquea las páginas de acceso", () => {
    expect(getAdminRedirect("/admin/login", anonymous)).toBeNull();
    expect(getAdminRedirect("/admin/recuperar", anonymous)).toBeNull();
    expect(getAdminRedirect("/admin/mfa", passwordOnly)).toBeNull();
  });
});
