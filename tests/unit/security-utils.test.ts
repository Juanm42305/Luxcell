import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { databaseErrorMessage, idleState } from "@/features/admin/action-state";
import { CATALOG_CACHE, CATALOG_TAG } from "@/lib/cache-tags";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { buildContentSecurityPolicy } from "@/lib/security/csp";
import { buildGeneralMessage } from "@/lib/whatsapp";

vi.mock("server-only", () => ({}));
const { ImageRejectedError, processImage } = await import("@/lib/images/process");

const toArrayBuffer = (buffer: Buffer) =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

const solid = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#ffdc08" } });

describe("processImage", () => {
  const limits = { maxWidth: 400, maxHeight: 400 };

  it("reconvierte a WebP, reduce el tamaño y descarta los metadatos", async () => {
    const jpg = await solid(900, 600)
      .jpeg()
      .withExif({ IFD0: { Copyright: "MARCA-SECRETA" } })
      .toBuffer();
    const output = await processImage(toArrayBuffer(jpg), limits);
    const meta = await sharp(output).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(400);
    expect(meta.exif).toBeUndefined();
  });

  it("acepta PNG y WebP", async () => {
    for (const buffer of [
      await solid(300, 300).png().toBuffer(),
      await solid(300, 300).webp().toBuffer(),
    ]) {
      await expect(processImage(toArrayBuffer(buffer), limits)).resolves.toBeInstanceOf(Buffer);
    }
  });

  it("rechaza archivos vacíos o disfrazados de imagen", async () => {
    await expect(processImage(new ArrayBuffer(0), limits)).rejects.toBeInstanceOf(
      ImageRejectedError,
    );
    const fake = Buffer.from("<?php system($_GET['c']); ?>");
    await expect(processImage(toArrayBuffer(fake), limits)).rejects.toThrow("JPG, PNG o WebP");
  });

  it("rechaza imágenes dañadas o fuera de medida", async () => {
    const broken = Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01, 0x02]);
    await expect(processImage(toArrayBuffer(broken), limits)).rejects.toBeInstanceOf(
      ImageRejectedError,
    );
    const tiny = await solid(50, 50).png().toBuffer();
    await expect(processImage(toArrayBuffer(tiny), limits)).rejects.toThrow("píxeles");
    // Una imagen gigantesca se rechaza antes de procesarla (evita agotar la memoria).
    const huge = await solid(8001, 200).png().toBuffer();
    await expect(processImage(toArrayBuffer(huge), limits)).rejects.toThrow("píxeles");
  });

  it("rechaza archivos de más de 15 MB sin leerlos", async () => {
    const big = new Uint8Array(15 * 1024 * 1024 + 1);
    big.set([0xff, 0xd8, 0xff]);
    await expect(processImage(big.buffer, limits)).rejects.toThrow("15 MB");
  });
});

describe("política de seguridad de contenido", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("en producción no permite eval y fuerza https", () => {
    vi.stubEnv("NODE_ENV", "production");
    const csp = buildContentSecurityPolicy("abc", "https://x.supabase.co");
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic';");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("en desarrollo permite lo que necesita el servidor de Next", () => {
    vi.stubEnv("NODE_ENV", "development");
    const csp = buildContentSecurityPolicy("abc", "http://127.0.0.1:54321");
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain(" ws:");
    expect(csp).not.toContain("upgrade-insecure-requests");
  });
});

describe("mensajes y utilidades", () => {
  it("traduce los errores de la base sin revelar detalles", () => {
    expect(idleState.status).toBe("idle");
    expect(databaseErrorMessage("23505")).toContain("Ya existe");
    expect(databaseErrorMessage("23503")).toContain("No se puede eliminar");
    expect(databaseErrorMessage("23514")).toContain("fuera de los límites");
    expect(databaseErrorMessage("42501")).toContain("permiso");
    expect(databaseErrorMessage(undefined)).toBe("No se pudo guardar. Inténtalo de nuevo.");
  });

  it("une clases, formatea fechas y arma el mensaje general", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(formatDate("2026-11-06T12:00:00Z")).toContain("2026");
    expect(buildGeneralMessage()).toContain("información");
    expect(CATALOG_TAG).toBe("catalogo");
    expect(CATALOG_CACHE.revalidateSeconds).toBeGreaterThan(0);
  });
});
