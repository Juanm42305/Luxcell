"use client";

import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/cn";
import { deleteImage, moveImage, setPrimaryImage, updateImageAlt } from "../actions/images";
import type { ActionState } from "../action-state";

type ManagedImage = { id: string; url: string; alt_text: string; is_primary: boolean };

const iconButton =
  "grid size-10 place-items-center rounded-full border border-line bg-surface transition-colors hover:border-ink disabled:opacity-40";

export function ImageManager({ images }: { images: ManagedImage[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function run(action: () => Promise<ActionState>) {
    startTransition(async () => {
      const result = await action();
      setMessage(result.status === "error" ? (result.message ?? "No se pudo completar.") : null);
      router.refresh();
    });
  }

  if (images.length === 0) {
    return (
      <p className="text-sm text-muted">
        Este producto aún no tiene fotos. En la web se muestra una ilustración de respaldo.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {message && (
        <p role="alert" className="rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
          {message}
        </p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <li
            key={image.id}
            className={cn(
              "rounded-2xl border bg-surface p-3",
              image.is_primary ? "border-ink" : "border-line",
            )}
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-paper">
              <Image
                src={image.url}
                alt={image.alt_text}
                fill
                sizes="300px"
                className="object-contain"
              />
              {image.is_primary && (
                <span className="absolute top-2 left-2 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-ink">
                  Principal
                </span>
              )}
            </div>
            <form
              className="mt-3"
              onSubmit={(event) => {
                event.preventDefault();
                const alt = String(new FormData(event.currentTarget).get("alt") ?? "");
                run(() => updateImageAlt(image.id, alt));
              }}
            >
              <label htmlFor={`alt-${image.id}`} className="text-xs font-medium text-muted">
                Descripción de la foto (para accesibilidad)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`alt-${image.id}`}
                  name="alt"
                  defaultValue={image.alt_text}
                  maxLength={200}
                  required
                  className="h-10 min-w-0 flex-1 rounded-xl border border-line px-3 text-sm focus:border-ink focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl border border-line px-3 text-sm hover:border-ink"
                >
                  Guardar
                </button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending || image.is_primary}
                onClick={() => run(() => setPrimaryImage(image.id))}
                aria-label="Usar como foto principal"
                title="Usar como foto principal"
                className={iconButton}
              >
                <Star aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                disabled={isPending || index === 0}
                onClick={() => run(() => moveImage(image.id, "up"))}
                aria-label="Mover antes"
                title="Mover antes"
                className={iconButton}
              >
                <ArrowUp aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                disabled={isPending || index === images.length - 1}
                onClick={() => run(() => moveImage(image.id, "down"))}
                aria-label="Mover después"
                title="Mover después"
                className={iconButton}
              >
                <ArrowDown aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setPendingDelete(image.id)}
                aria-label="Eliminar foto"
                title="Eliminar foto"
                className={cn(iconButton, "ml-auto text-warn hover:border-warn")}
              >
                <Trash2 aria-hidden className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar esta foto?"
        description="Se borra del producto y de la web. No se puede deshacer."
        confirmLabel="Sí, eliminar foto"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const id = pendingDelete;
          setPendingDelete(null);
          if (id) run(() => deleteImage(id));
        }}
      />
    </div>
  );
}
