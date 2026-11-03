// Prueba LOCAL de punta a punta y sondeos de ataque. Nunca apuntarla a producción.
// Requiere Supabase local y la app en :3000 (npm run build && npx next start). Uso: docs/SECURITY.md
import { chromium } from "playwright-core";
import crypto from "node:crypto";

const app = "http://localhost:3000";
const api = "http://127.0.0.1:54321";
// Dirección secreta del panel: la misma ADMIN_ACCESS_PATH de .env.local.
const ADMIN = "/" + process.env.ADMIN_ACCESS_PATH;
if (ADMIN === "/undefined") throw new Error("Define ADMIN_ACCESS_PATH");
const pub = process.env.PUB;
const secret = process.env.SEC;
let failures = 0;
const randomPassword = () => crypto.randomBytes(12).toString("hex") + "aA1";
const clean = (value) =>
  String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 300);
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FAIL"} ${clean(name)}${extra ? " :: " + clean(extra) : ""}`);
  if (!ok) failures++;
};

// TOTP RFC 6238 para simular la app autenticadora
function totp(base32) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32.replace(/=+$/, "")) bits += alpha.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, "0");
}

const headers = { apikey: pub, Authorization: `Bearer ${pub}` };
const rest = (path, init = {}) =>
  fetch(`${api}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, "Content-Type": "application/json", ...init.headers },
  });

console.log("\n== Ataques a la API con la clave pública ==");
for (const t of [
  "inquiries",
  "pqr_requests",
  "admin_profiles",
  "inventory_movements",
  "products",
  "product_images",
]) {
  const r = await rest(`${t}?select=*`);
  check(`lectura de ${t} denegada`, r.status === 401 || r.status === 403, `HTTP ${r.status}`);
}
let r = await rest("catalog_products?select=stock_quantity");
check("no se pueden pedir existencias a la vista", r.status === 400, `HTTP ${r.status}`);
r = await rest("catalog_products?select=*&limit=1");
const row = (await r.json())[0];
check("la vista pública funciona", r.status === 200 && !!row);
check(
  "la vista no incluye stock ni umbral",
  row && !("stock_quantity" in row) && !("low_stock_threshold" in row),
);
r = await rest("products?id=not.is.null", { method: "PATCH", body: JSON.stringify({ price: 1 }) });
check("cambiar precios denegado", r.status === 401 || r.status === 403, `HTTP ${r.status}`);
r = await rest("catalog_products?id=not.is.null", {
  method: "PATCH",
  body: JSON.stringify({ price: 1 }),
});
const after = await (await rest("catalog_products?select=price&id=eq." + row.id)).json();
check(
  "escribir por la vista no tiene efecto",
  r.status >= 400 && after[0].price === row.price,
  `HTTP ${r.status}`,
);
r = await rest("inquiries", {
  method: "POST",
  body: JSON.stringify({ customer_name: "x", customer_email: "x@x.co", consent_version: "1" }),
});
check(
  "insertar consultas directo denegado",
  r.status === 401 || r.status === 403,
  `HTTP ${r.status}`,
);
r = await rest("admin_profiles", {
  method: "POST",
  body: JSON.stringify({ auth_user_id: crypto.randomUUID() }),
});
check("crearse admin denegado", r.status === 401 || r.status === 403, `HTTP ${r.status}`);
r = await rest("rpc/set_stock_quantity", {
  method: "POST",
  body: JSON.stringify({ p_product_id: row.id, p_quantity: 999 }),
});
check(
  "modificar inventario por RPC denegado",
  r.status === 401 || r.status === 403 || r.status === 404,
  `HTTP ${r.status}`,
);
r = await rest("business_settings?id=eq.true", {
  method: "PATCH",
  body: JSON.stringify({ whatsapp_number: "573000000000" }),
});
check("cambiar WhatsApp denegado", r.status === 401 || r.status === 403, `HTTP ${r.status}`);
r = await fetch(`${api}/storage/v1/object/product-images/malo.webp`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "image/webp" },
  body: "x",
});
check("subir archivo denegado", r.status >= 400, `HTTP ${r.status}`);
r = await fetch(`${api}/storage/v1/object/list/product-images`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ prefix: "" }),
});
const listed = r.ok ? await r.json() : [];
check("listar bucket no devuelve nada", listed.length === 0, `HTTP ${r.status}`);
r = await fetch(`${api}/auth/v1/signup`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "atacante@prueba.invalid", password: randomPassword() }),
});
const signupBody = await r.json();
check(
  "registro público desactivado",
  r.status >= 400 && /signup_disabled|Signups not allowed/i.test(JSON.stringify(signupBody)),
  JSON.stringify(signupBody).slice(0, 90),
);

console.log("\n== Encabezados y rutas de la aplicación ==");
r = await fetch(app + "/", { redirect: "manual" });
const csp = r.headers.get("content-security-policy") ?? "";
check(
  "CSP con nonce",
  /script-src 'self' 'nonce-/.test(csp) &&
    csp.includes("strict-dynamic") &&
    !/script-src[^;]*unsafe-inline/.test(csp),
);
check("CSP sin unsafe-eval en producción", !csp.includes("unsafe-eval"));
check("frame-ancestors none", csp.includes("frame-ancestors 'none'"));
for (const [h, v] of [
  ["strict-transport-security", "max-age=63072000"],
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["referrer-policy", "strict-origin"],
  ["permissions-policy", "camera=()"],
]) {
  check(`encabezado ${h}`, (r.headers.get(h) ?? "").includes(v), r.headers.get(h) ?? "");
}
check("no revela X-Powered-By", !r.headers.get("x-powered-by"));
const html = await r.text();
check(
  "el HTML no contiene la clave secreta",
  !html.includes(secret) && !html.includes("sb_secret_"),
);
const [biz] = await (
  await rest("business_settings?select=business_name,whatsapp_number,phone,contact_email")
).json();
const bizComplete = Boolean(
  biz.business_name && biz.whatsapp_number && biz.phone && biz.contact_email,
);
const hasNoindex = /<meta name="robots" content="noindex/.test(html);
check(
  bizComplete ? "indexable con los datos completos" : "noindex mientras faltan datos",
  bizComplete ? !hasNoindex : hasNoindex,
);
const nonce1 = csp.match(/nonce-([^']+)/)[1];
const r2 = await fetch(app + "/");
check(
  "el nonce cambia en cada respuesta",
  r2.headers.get("content-security-policy").match(/nonce-([^']+)/)[1] !== nonce1,
);
for (const p of [
  "/admin",
  "/admin/login",
  "/admin/productos",
  "/admin/mfa",
  "/administrador",
  "/panel",
]) {
  const a = await fetch(app + p, { redirect: "manual" });
  check(`${p} no existe (404, sin pistas del panel)`, a.status === 404, `HTTP ${a.status}`);
}
for (const p of [
  "",
  "/productos",
  "/productos/nuevo",
  "/configuracion",
  "/mfa",
  "/nueva-contrasena",
]) {
  const a = await fetch(app + ADMIN + p, { redirect: "manual" });
  check(
    `ruta secreta${p || " (resumen)"} sin sesión redirige al login`,
    a.status === 307 && a.headers.get("location").endsWith(ADMIN + "/login"),
    `${a.status}`,
  );
}
const panelLogin = await fetch(app + ADMIN + "/login");
check(
  "la ruta secreta lleva noindex",
  (panelLogin.headers.get("x-robots-tag") ?? "").includes("noindex"),
);
const home = await (await fetch(app + "/")).text();
check("la página pública no revela la ruta secreta", !home.includes(process.env.ADMIN_ACCESS_PATH));
r = await fetch(app + "/catalogo?q=" + encodeURIComponent("' OR 1=1;--") + "&min=abc&orden=DROP");
check(
  "inyección en filtros no rompe ni filtra",
  r.status === 200 && (await r.text()).includes("No encontramos productos"),
);
r = await fetch(app + "/catalogo?q=" + encodeURIComponent("<script>alert(1)</script>"));
check(
  "XSS en la búsqueda queda escapado",
  r.status === 200 && !(await r.text()).includes("<script>alert(1)</script>"),
);
r = await fetch(app + "/auth/callback?code=falso&next=https://malo.example", {
  redirect: "manual",
});
check(
  "callback no redirige a sitios externos",
  r.headers.get("location") === app + "/",
  r.headers.get("location"),
);
for (const query of ["", "?code=falso", "?error=access_denied"]) {
  const leak = await fetch(app + "/auth/callback" + query, { redirect: "manual" });
  check(
    `callback${query || " sin código"} no revela la ruta secreta`,
    !(leak.headers.get("location") ?? "").includes(process.env.ADMIN_ACCESS_PATH),
  );
}
r = await fetch(app + "/producto/" + encodeURIComponent("' OR 1=1--"));
check("slug malicioso da 404", r.status === 404, `HTTP ${r.status}`);

console.log("\n== Flujo real de administrador ==");
const adminApi = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};
const stamp = Date.now();
const adminEmail = `admin-${stamp}@example.com`;
const password = randomPassword();
const mk = async (email) =>
  await (
    await fetch(`${api}/auth/v1/admin/users`, {
      method: "POST",
      headers: adminApi,
      body: JSON.stringify({ email, password, email_confirm: true }),
    })
  ).json();
const adminUser = await mk(adminEmail);
const plainUser = await mk(`normal-${stamp}@example.com`);
r = await fetch(`${api}/rest/v1/admin_profiles`, {
  method: "POST",
  headers: adminApi,
  body: JSON.stringify({ auth_user_id: adminUser.id }),
});
check(
  "preparación: perfil admin creado",
  r.status === 201,
  `HTTP ${r.status} ${r.status === 201 ? "" : await r.text()}`,
);

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const cspErrors = [];
page.on("console", (m) => {
  if (/Content Security Policy|violates/i.test(m.text())) cspErrors.push(m.text());
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(app + ADMIN + "/login");
await page.fill("#email", adminEmail);
await page.fill("#password", randomPassword());
await page.click("button[type=submit]");
await page.waitForSelector("p[role=alert]");
check(
  "contraseña errada: mensaje genérico",
  (await page.textContent("p[role=alert]")).includes("Correo o contraseña incorrectos"),
);

await page.fill("#password", password);
await page.click("button[type=submit]");
await page.waitForURL("**" + ADMIN + "/mfa");
check("tras la contraseña pide segundo factor", page.url().endsWith(ADMIN + "/mfa"));
await page.goto(app + ADMIN);
check("sin MFA no entra al panel", page.url().endsWith(ADMIN + "/mfa"), page.url());
await page.getByRole("button", { name: "Configurar autenticador" }).click();
await page.waitForSelector("code");
const qrOk = await page
  .locator('img[alt^="Código QR"]')
  .evaluate((i) => i.complete && i.naturalWidth > 0);
check("el QR se muestra (CSP lo permite)", qrOk);
const totpSecret = await page.textContent("code");
await page.fill("#code", "000000");
await page.click("button[type=submit]");
await page.waitForSelector("p[role=alert]");
check(
  "código TOTP errado rechazado",
  (await page.textContent("p[role=alert]")).includes("Código incorrecto") &&
    page.url().endsWith(ADMIN + "/mfa"),
);
await page.fill("#code", totp(totpSecret));
await page.click("button[type=submit]");
await page.waitForURL((u) => u.pathname === ADMIN, { timeout: 15000 });
await page.waitForSelector("h1");
check("con MFA entra al panel", (await page.textContent("h1")) === "Resumen");
const stats = await page.locator("dd").allTextContents();
check("el panel lee datos reales (RLS admite aal2)", stats[0] === "10", `productos=${stats[0]}`);

const cookies = await ctx.cookies();
const sessionCookie = cookies.find((c) => c.name.includes("auth-token"));
check("cookie de sesión SameSite=Lax", sessionCookie?.sameSite === "Lax");

await page.getByRole("button", { name: "Cerrar sesión" }).click();
await page.waitForURL("**" + ADMIN + "/login");
check("cerrar sesión funciona", page.url().endsWith(ADMIN + "/login"));
await page.goto(app + ADMIN);
check("tras cerrar sesión no hay acceso", page.url().endsWith(ADMIN + "/login"), page.url());

// Segundo ingreso: con factor ya registrado debe pedir solo el código
await page.fill("#email", adminEmail);
await page.fill("#password", password);
await page.click("button[type=submit]");
await page.waitForSelector("#code");
check(
  "segundo ingreso no muestra QR de nuevo",
  (await page.locator('img[alt^="Código QR"]').count()) === 0,
);

// Un usuario válido pero no administrador, incluso con MFA, no entra
const ctx2 = await browser.newContext();
const p2 = await ctx2.newPage();
await p2.goto(app + ADMIN + "/login");
await p2.fill("#email", plainUser.email);
await p2.fill("#password", password);
await p2.click("button[type=submit]");
await p2.waitForURL("**" + ADMIN + "/mfa");
await p2.getByRole("button", { name: "Configurar autenticador" }).click();
await p2.waitForSelector("code");
const s2 = await p2.textContent("code");
await p2.fill("#code", totp(s2));
await p2.click("button[type=submit]");
await p2.waitForURL((u) => u.pathname === ADMIN + "/login", { timeout: 15000 });
check(
  "usuario sin perfil de admin no entra, aun con MFA",
  p2.url().endsWith(ADMIN + "/login"),
  p2.url(),
);

// Enlace de recuperación robado: sesión de contraseña (aal1) contra una cuenta con MFA
const link = await (
  await fetch(`${api}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: adminApi,
    body: JSON.stringify({ type: "recovery", email: adminEmail }),
  })
).json();
const verified = await (
  await fetch(`${api}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: pub, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "recovery", token_hash: link.hashed_token }),
  })
).json();
check("preparación: enlace de recuperación canjeado", !!verified.access_token);
const stolenPassword = randomPassword();
const change = await fetch(`${api}/auth/v1/user`, {
  method: "PUT",
  headers: {
    apikey: pub,
    Authorization: `Bearer ${verified.access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ password: stolenPassword }),
});
const changeBody = await change.text();
check(
  "enlace robado NO cambia la contraseña sin MFA",
  change.status >= 400,
  `HTTP ${change.status} ${changeBody.slice(0, 90)}`,
);
const stolenLogin = await fetch(`${api}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: pub, "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: stolenPassword }),
});
check(
  "la contraseña del atacante no sirve",
  stolenLogin.status >= 400,
  `HTTP ${stolenLogin.status}`,
);
const asRecovered = await fetch(`${api}/rest/v1/inquiries?select=*`, {
  headers: { apikey: pub, Authorization: `Bearer ${verified.access_token}` },
});
check(
  "enlace robado no lee consultas",
  asRecovered.ok ? (await asRecovered.json()).length === 0 : true,
  `HTTP ${asRecovered.status}`,
);

// Recuperación real desde la interfaz, con correo capturado por Mailpit
await new Promise((res) => setTimeout(res, 62000)); // respeta max_frequency = 60s
const ctx3 = await browser.newContext();
const p3 = await ctx3.newPage();
await p3.goto(app + ADMIN + "/recuperar");
await p3.fill("#email", adminEmail);
await p3.click("button[type=submit]");
await p3.waitForSelector("p[role=status]");
check(
  "recuperación responde igual sin revelar la cuenta",
  (await p3.textContent("p[role=status]")).includes("Si el correo corresponde"),
);
await p3.waitForTimeout(1500);
const mails = await (await fetch("http://127.0.0.1:54324/api/v1/messages")).json();
const mail = mails.messages.find((m) => m.To.some((t) => t.Address === adminEmail));
check("llegó el correo de recuperación", !!mail);
const mailBody = await (await fetch(`http://127.0.0.1:54324/api/v1/message/${mail.ID}`)).json();
const recoveryUrl = mailBody.Text.match(/https?:\/\/\S+/)[0].replace(/&amp;/g, "&");
await p3.goto(recoveryUrl);
await p3.waitForURL((u) => u.pathname === ADMIN + "/mfa", { timeout: 15000 });
check(
  "el enlace exige MFA antes de cambiar la contraseña",
  p3.url().includes("siguiente=contrasena"),
  p3.url(),
);
await p3.waitForSelector("#code");
await new Promise((res) => setTimeout(res, (31 - ((Date.now() / 1000) % 30)) * 1000)); // código nuevo
await p3.fill("#code", totp(totpSecret));
await p3.click("button[type=submit]");
await p3.waitForURL((u) => u.pathname === ADMIN + "/nueva-contrasena", { timeout: 15000 });
await p3.fill("#password", "corta");
await p3.evaluate(() => (document.querySelector("form").noValidate = true));
await p3.click("button[type=submit]");
await p3.waitForSelector("p[role=alert]");
check(
  "contraseña débil rechazada",
  (await p3.textContent("p[role=alert]")).includes("12 caracteres"),
);
const newPassword = randomPassword();
await p3.fill("#password", newPassword);
await p3.click("button[type=submit]");
await p3.waitForURL((u) => u.pathname === ADMIN, { timeout: 15000 });
const relogin = await fetch(`${api}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: pub, "Content-Type": "application/json" },
  body: JSON.stringify({ email: adminEmail, password: newPassword }),
});
check("la contraseña nueva funciona", relogin.status === 200, `HTTP ${relogin.status}`);

// Catálogo público sin violaciones de CSP
await page.goto(app + "/");
await page.goto(app + "/catalogo");
await page.goto(app + "/producto/ejemplo-iphone-a");
const articles = await browser.newPage().then(async (p) => {
  await p.goto(app + "/catalogo");
  return p.locator("article").count();
});
check("el catálogo muestra los productos de Supabase", articles === 10, `${articles}`);
check("sin violaciones de CSP en el navegador", cspErrors.length === 0, cspErrors[0] ?? "");

await browser.close();
console.log(`\n${failures === 0 ? "TODO OK" : failures + " FALLOS"}`);
process.exit(failures ? 1 : 0);
