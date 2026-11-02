import "server-only";
import sharp from "sharp";

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MIN_SIDE = 200;
const MAX_SIDE = 8000;

/** Firma real del archivo: no se confía en la extensión ni en el tipo que declara el navegador. */
function detectImageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return "png";
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export class ImageRejectedError extends Error {}

/**
 * Valida y reconvierte una imagen subida. La salida es siempre un WebP nuevo: se descartan los
 * metadatos (incluida la ubicación GPS de las fotos de celular) y cualquier contenido incrustado.
 */
export async function processImage(
  input: ArrayBuffer,
  { maxWidth, maxHeight }: { maxWidth: number; maxHeight: number },
): Promise<Buffer> {
  if (input.byteLength === 0 || input.byteLength > MAX_INPUT_BYTES) {
    throw new ImageRejectedError("La imagen debe pesar menos de 15 MB.");
  }
  const bytes = new Uint8Array(input);
  if (!detectImageType(bytes)) {
    throw new ImageRejectedError("Solo se aceptan imágenes JPG, PNG o WebP.");
  }

  const image = sharp(bytes, { limitInputPixels: 50_000_000, failOn: "error" });
  let metadata: Awaited<ReturnType<typeof image.metadata>>;
  try {
    metadata = await image.metadata();
  } catch {
    throw new ImageRejectedError("El archivo está dañado o no es una imagen válida.");
  }

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (Math.min(width, height) < MIN_SIDE || Math.max(width, height) > MAX_SIDE) {
    throw new ImageRejectedError(
      `La imagen debe medir entre ${MIN_SIDE} y ${MAX_SIDE} píxeles por lado.`,
    );
  }

  return image
    .rotate()
    .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
