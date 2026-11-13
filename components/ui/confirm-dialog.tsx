"use client";

import { TriangleAlert } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef } from "react";
import { buttonClasses } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmación con el diseño de la página, en lugar del `window.confirm` del navegador.
 * Usa `<dialog>` nativo: bloquea el fondo, atrapa el foco y se cierra con Esc sin código extra.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // Esc dispara `cancel`; se evita el cierre nativo para que el estado mande.
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      // Un clic en el fondo oscuro (fuera de la tarjeta) también cancela.
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-line bg-surface p-0 text-ink shadow-[0_24px_60px_-20px_rgb(10_10_10/0.45)] backdrop:bg-night/60 backdrop:backdrop-blur-sm open:animate-pop"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand">
            <TriangleAlert aria-hidden className="size-5 text-ink" />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1.5 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className={buttonClasses("secondary")}
          >
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className={buttonClasses("primary")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
