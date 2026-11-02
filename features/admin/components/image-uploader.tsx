"use client";

import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import type { ActionState } from "../action-state";

const ACCEPTED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 15 * 1024 * 1024;

type Pending = { id: string; file: File; preview: string };

type ImageUploaderProps = {
  /** Publica un archivo ya subido a la cuarentena. */
  publish: (quarantinePath: string) => Promise<ActionState>;
  multiple?: boolean;
  label: string;
};

/**
 * Previsualiza las fotos antes de publicarlas. Estas comprobaciones solo avisan rápido: la
 * validación que cuenta la hace el servidor sobre el contenido real del archivo.
 */
export function ImageUploader({ publish, multiple = true, label }: ImageUploaderProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isUploading, startUpload] = useTransition();

  useEffect(() => () => pending.forEach((item) => URL.revokeObjectURL(item.preview)), [pending]);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const rejected: string[] = [];
    const accepted: Pending[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED[file.type]) rejected.push(`${file.name}: solo JPG, PNG o WebP.`);
      else if (file.size > MAX_BYTES) rejected.push(`${file.name}: pesa más de 15 MB.`);
      else accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }
    setMessages(rejected);
    setPending((current) =>
      multiple ? [...current, ...accepted].slice(0, 10) : accepted.slice(0, 1),
    );
    if (input.current) input.current.value = "";
  }

  function uploadAll() {
    startUpload(async () => {
      const supabase = createBrowserSupabase();
      const results: string[] = [];
      for (const item of pending) {
        // Nombre aleatorio: el nombre original del archivo nunca llega al almacenamiento.
        const path = `${crypto.randomUUID()}.${ACCEPTED[item.file.type]}`;
        const { error } = await supabase.storage
          .from("uploads-quarantine")
          .upload(path, item.file, { contentType: item.file.type, upsert: false });
        if (error) {
          results.push(`${item.file.name}: no se pudo subir.`);
          continue;
        }
        const result = await publish(path);
        if (result.status === "error") results.push(`${item.file.name}: ${result.message}`);
      }
      setMessages(results.length ? results : ["Listo: imágenes publicadas."]);
      setPending([]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-surface px-4 py-8 text-center hover:border-ink">
        <ImagePlus aria-hidden className="size-6 text-muted" />
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted">JPG, PNG o WebP · máximo 15 MB por foto</span>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={(event) => addFiles(event.target.files)}
          className="sr-only"
        />
      </label>

      {pending.length > 0 && (
        <>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {pending.map((item) => (
              <li
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-xl border border-line bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- previsualización local (blob:) */}
                <img
                  src={item.preview}
                  alt={`Previsualización de ${item.file.name}`}
                  className="size-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setPending((current) => current.filter((p) => p.id !== item.id))}
                  aria-label={`Quitar ${item.file.name}`}
                  className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-ink/80 text-white"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={uploadAll}
            disabled={isUploading}
            className={buttonClasses("primary")}
          >
            {isUploading
              ? "Publicando…"
              : `Publicar ${pending.length === 1 ? "1 imagen" : `${pending.length} imágenes`}`}
          </button>
        </>
      )}

      {messages.length > 0 && (
        <ul role="status" className="space-y-1 text-sm text-ink-soft">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
