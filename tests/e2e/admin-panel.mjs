// Prueba LOCAL del panel administrativo de punta a punta, con ataques a la carga de archivos y XSS.
// Requiere Supabase local, la app en :3000 y las variables PUB, SEC y ADMIN_ACCESS_PATH.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const sharp = createRequire(import.meta.url)("sharp");
const app = "http://localhost:3000";
const api = "http://127.0.0.1:54321";
const ADMIN = "/" + process.env.ADMIN_ACCESS_PATH;
const secret = process.env.SEC;
let failures = 0;
const clean = (value) =>
  String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 300);
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FAIL"} ${clean(name)}${extra ? " :: " + clean(extra) : ""}`);
  if (!ok) failures++;
};

function totp(base32) {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of base32) {
    if (c === "=") break; // el relleno solo va al final
    bits += alpha.indexOf(c).toString(2).padStart(5, "0");
  }
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => Number.parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac("sha1", key).update(counter).digest();
  const o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1000000).padStart(6, "0");
}

// Archivos de prueba
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "panel-"));
const goodJpg = path.join(dir, "foto-buena.jpg");
await sharp({ create: { width: 900, height: 900, channels: 3, background: "#ffdc08" } })
  .jpeg()
  .withExif({ IFD0: { Copyright: "MARCA-EXIF-SECRETA" } })
  .toFile(goodJpg);
const fakeJpg = path.join(dir, "malicioso.jpg");
fs.writeFileSync(fakeJpg, "<?php system($_GET['c']); ?><script>alert(1)</script>");
const polyglot = path.join(dir, "poliglota.jpg");
fs.writeFileSync(
  polyglot,
  Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    Buffer.from("<script>alert(1)</script>".repeat(50)),
  ]),
);
const tiny = path.join(dir, "diminuta.png");
await sharp({ create: { width: 20, height: 20, channels: 3, background: "#000" } })
  .png()
  .toFile(tiny);

// Administrador de prueba
const adminApi = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
};
const email = `panel-${Date.now()}@example.com`;
const password = crypto.randomBytes(12).toString("hex") + "aA1";
const user = await (
  await fetch(`${api}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminApi,
    body: JSON.stringify({ email, password, email_confirm: true }),
  })
).json();
await fetch(`${api}/rest/v1/admin_profiles`, {
  method: "POST",
  headers: adminApi,
  body: JSON.stringify({ auth_user_id: user.id }),
});

const browser = await chromium.launch({ channel: "msedge" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem("luxcell-aceptacion-legal", "2026-11-06"));
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
const dialogs = [];
page.on("dialog", async (d) => {
  dialogs.push(d.message());
  await d.accept();
});

await page.goto(app + ADMIN + "/login");
await page.fill("#email", email);
await page.fill("#password", password);
await page.click("button[type=submit]");
await page.waitForURL("**" + ADMIN + "/mfa");
await page.getByRole("button", { name: "Configurar autenticador" }).click();
await page.waitForSelector("code");
await page.fill("#code", totp(await page.textContent("code")));
await page.click("button[type=submit]");
await page.waitForURL((u) => u.pathname === ADMIN, { timeout: 15000 });
check("acceso al panel por la ruta secreta con MFA", (await page.textContent("h1")) === "Resumen");

// Marca
await page.goto(app + ADMIN + "/marcas");
const brandName = `Marca Prueba ${Date.now()}`;
await page.fill("#nuevo-name", brandName);
await page.getByRole("button", { name: "Crear" }).click();
await page.waitForSelector("text=Marca creada.");
check("crear marca", true);
check(
  "tras crear, el formulario queda vacío para otra marca",
  (await page.inputValue("#nuevo-name")) === "" && (await page.inputValue("#nuevo-slug")) === "",
);
await page.fill("#nuevo-name", brandName.toUpperCase());
await page.fill("#nuevo-slug", `otra-${Date.now()}`);
await page.getByRole("button", { name: "Crear" }).click();
await page.waitForSelector("text=Ya existe una marca llamada");
check("no deja crear la misma marca con otras mayúsculas", true);

// Producto con intento de XSS en el nombre
const xssName = `Equipo <img src=x onerror="window.__xss=1"> ${Date.now()}`;
await page.goto(app + ADMIN + "/productos/nuevo");
await page.fill("#name", xssName);
const slug = await page.inputValue("#slug");
check("el slug se genera solo y es seguro", /^[a-z0-9-]+$/.test(slug), slug);
await page.fill("#model", "MOD-1");
await page.selectOption("#brandId", { label: brandName });
await page.selectOption("#categoryId", { label: "iPhone" });
await page.fill("#shortDescription", "Descripción breve de prueba.");
await page.fill("#description", "Descripción completa de prueba.");
await page.fill("#specs", "Pantalla: 6,1 pulgadas\nBatería: prueba");
await page.fill("#price", "2.500.000");
await page.selectOption("#condition", "display");
check(
  "el almacenamiento ofrece solo 64 GB, 128 GB, 256 GB, 512 GB y 1 TB",
  JSON.stringify(await page.locator("#storageCapacity option").allTextContents()) ===
    JSON.stringify(["Sin almacenamiento", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"]),
);
await page.selectOption("#storageCapacity", "1 TB");
check(
  "el estado ofrece solo Nuevo, Exhibición, Seminuevo y Reacondicionado",
  JSON.stringify(await page.locator("#condition option").allTextContents()) ===
    JSON.stringify(["Nuevo", "Exhibición", "Seminuevo", "Reacondicionado"]),
);
await page
  .getByRole("group", { name: "Colores sugeridos" })
  .getByRole("button", { name: "Agregar Negro", exact: true })
  .click();
await page.getByPlaceholder("Escribe un color y pulsa Enter").fill("Azul pacífico");
await page.keyboard.press("Enter");
await page
  .getByRole("group", { name: "Colores sugeridos" })
  .getByRole("button", { name: "Agregar Blanco", exact: true })
  .click();
await page.getByRole("button", { name: "Quitar Blanco" }).click();
await page.fill("#salePrice", "2.600.000");
await page.fill("#offerValidUntil", "2099-12-31");
await page.fill("#initialStock", "-5");
await page.check('input[name="isActive"]');
await page.getByRole("button", { name: "Crear producto" }).click();
await page.waitForSelector("#initialStock-error");
check(
  "existencias negativas rechazadas",
  (await page.textContent("#initialStock-error")).includes("negativ"),
);
check(
  "precio en oferta mayor que el normal rechazado",
  (await page.textContent("#salePrice-error")).includes("menor"),
);
await page.fill("#salePrice", "2.300.000");
await page.fill("#initialStock", "4");
await page.getByRole("button", { name: "Crear producto" }).click();
await page.waitForURL(
  (u) => u.pathname.startsWith(ADMIN + "/productos/") && u.searchParams.get("creado") === "1",
  { timeout: 15000 },
);
check("crear producto", true);
const productUrl = page.url();

// Ataques a la carga de imágenes
async function upload(file) {
  await page.setInputFiles('input[type="file"]', file);
  await page.getByRole("button", { name: /^Publicar/ }).click();
  await page.waitForSelector('ul[role="status"] li', { timeout: 30000 });
  const text = (await page.locator('ul[role="status"]').textContent()) ?? "";
  return text;
}
let result = await upload(fakeJpg);
check(
  "archivo de texto con extensión .jpg rechazado",
  result.includes("Solo se aceptan imágenes"),
  result,
);
result = await upload(polyglot);
check(
  "archivo políglota (cabecera JPG + script) rechazado",
  /dañado|no es una imagen/.test(result),
  result,
);
result = await upload(tiny);
check("imagen demasiado pequeña rechazada", result.includes("píxeles"), result);
const { count: quarantineLeft } = await fetch(`${api}/storage/v1/object/list/uploads-quarantine`, {
  method: "POST",
  headers: adminApi,
  body: JSON.stringify({ prefix: "" }),
}).then(async (r) => ({ count: (await r.json()).length }));
check("la cuarentena queda vacía tras los rechazos", quarantineLeft === 0, `${quarantineLeft}`);

result = await upload(goodJpg);
check("foto válida publicada", result.includes("Listo"), result);
await page.waitForSelector("text=Principal");
const imageRow = await (
  await fetch(`${api}/rest/v1/product_images?select=storage_path`, { headers: adminApi })
).json();
const stored = imageRow.at(-1).storage_path;
// Solo se usa en una URL si tiene exactamente la forma esperada: <uuid>/<uuid>.webp
if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/.test(stored))
  throw new Error("Ruta de imagen inesperada");
const storedUrl = new URL(
  `/storage/v1/object/public/product-images/${stored.split("/").map(encodeURIComponent).join("/")}`,
  api,
);
check(
  "se guarda con nombre aleatorio y extensión .webp",
  /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/.test(stored),
  stored,
);
const publicBytes = Buffer.from(await (await fetch(storedUrl)).arrayBuffer());
check(
  "el archivo publicado es WebP real",
  publicBytes.subarray(0, 4).toString() === "RIFF" &&
    publicBytes.subarray(8, 12).toString() === "WEBP",
);
check(
  "se eliminaron los metadatos EXIF",
  !publicBytes.includes(Buffer.from("MARCA-EXIF-SECRETA")) &&
    !publicBytes.includes(Buffer.from("Exif")),
);

// Inventario
await page.fill("#quantity", "0");
await page.fill("#reason", "Prueba de agotado");
await page.getByRole("button", { name: "Actualizar existencias" }).click();
await page.waitForSelector("text=Existencias actualizadas.");
check("existencias actualizadas", true);

// La web pública
const pub2 = await ctx.newPage();
await pub2.goto(app + "/producto/" + slug, { waitUntil: "networkidle" });
check(
  "la web muestra el producto como Agotado",
  (await pub2.textContent("main")).includes("Agotado"),
);
check(
  "el botón ofrece reposición, no compra",
  (await pub2.textContent("main")).includes("Preguntar por reposición"),
);
const img = pub2.locator("main img[src*='_next/image']").first();
check("la foto se ve en la web", await img.evaluate((i) => i.complete && i.naturalWidth > 0));
check(
  "el nombre con HTML se muestra como texto (sin XSS)",
  (await pub2.evaluate(() => window.__xss)) === undefined &&
    (await pub2.textContent("h1")).includes("<img"),
);
check("precio con formato colombiano", (await pub2.textContent("main")).includes("$2.500.000 COP"));
const publicText = await pub2.textContent("main");
check("la web muestra el estado Exhibición", publicText.includes("Exhibición"));
check("la web muestra el almacenamiento elegido", publicText.includes("1 TB"));
check("la web muestra los colores elegidos", publicText.includes("Negro, Azul pacífico"));
check(
  "la web muestra la oferta con descuento y contador",
  publicText.includes("$2.300.000 COP") &&
    publicText.includes("−8 %") &&
    /Termina en \d+ d \d{2}:\d{2}:\d{2}/.test(publicText),
  publicText.slice(0, 200),
);
await pub2.close();

// Eliminar producto: también borra el archivo
await page.goto(productUrl);
await page.getByRole("button", { name: "Eliminar producto" }).click();
await page.getByRole("button", { name: "Sí, eliminar" }).click();
await page.waitForURL((u) => u.searchParams.get("eliminado") === "1", { timeout: 15000 });
const gone = await fetch(storedUrl);
check(
  "al eliminar, la foto desaparece del almacenamiento",
  gone.status >= 400,
  `HTTP ${gone.status}`,
);
const page404 = await fetch(app + "/producto/" + slug);
check("la página del producto eliminado da 404", page404.status === 404);

// Marca en uso: no se puede borrar si hay productos (aquí ya no hay, se puede)
await page.goto(app + ADMIN + "/marcas");
check("sin errores de consola en el panel", consoleErrors.length === 0, consoleErrors[0] ?? "");

await browser.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log(failures ? `${failures} FALLOS` : "TODO OK");
process.exit(failures ? 1 : 0);
