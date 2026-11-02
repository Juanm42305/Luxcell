"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { buttonClasses } from "@/components/ui/button";

/** Hoja inferior de filtros para móvil. `<dialog>` aporta foco atrapado y cierre con Escape. */
export function FilterSheet({
  children,
  activeCount,
}: {
  children: ReactNode;
  activeCount: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className={buttonClasses("secondary", "md", "shrink-0 lg:hidden")}
      >
        <SlidersHorizontal aria-hidden className="size-4" />
        Filtros{activeCount > 0 && ` (${activeCount})`}
      </button>
      <dialog
        ref={dialog}
        aria-label="Filtros del catálogo"
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-3xl bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold tracking-tight">Filtros</p>
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => dialog.current?.close()}
            className="grid size-11 place-items-center rounded-full hover:bg-ink/5"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}
