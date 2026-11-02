"use client";

import { useState, useTransition } from "react";
import { buttonClasses } from "@/components/ui/button";
import type { ActionState } from "../action-state";

type ConfirmButtonProps = {
  action: () => Promise<ActionState>;
  label: string;
  confirmText: string;
};

/** Acción destructiva con confirmación explícita en dos pasos. */
export function ConfirmButton({ action, label, confirmText }: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className={buttonClasses("secondary", "md", "text-warn hover:border-warn")}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-warn/40 bg-warn-soft p-3">
      <p className="text-sm text-warn">{confirmText}</p>
      {message && (
        <p role="alert" className="text-sm font-medium text-warn">
          {message}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await action();
              if (result.status === "error") setMessage(result.message ?? "No se pudo completar.");
              else setIsConfirming(false);
            })
          }
          className={buttonClasses("primary")}
        >
          {isPending ? "Eliminando…" : "Sí, eliminar"}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className={buttonClasses("ghost")}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
