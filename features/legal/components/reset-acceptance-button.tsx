"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { LEGAL_ACCEPTANCE_KEY } from "../acceptance";

/** Permite retirar la preferencia guardada en este navegador. */
export function ResetAcceptanceButton() {
  const [wasReset, setWasReset] = useState(false);

  function reset() {
    try {
      window.localStorage.removeItem(LEGAL_ACCEPTANCE_KEY);
    } catch {
      // Sin almacenamiento no hay nada guardado que borrar.
    }
    setWasReset(true);
  }

  return (
    <div className="mt-4">
      <button type="button" onClick={reset} className={buttonClasses("secondary")}>
        Borrar mi aceptación en este navegador
      </button>
      {wasReset && (
        <p role="status" className="mt-2 text-sm text-muted">
          Listo. La caja de ingreso volverá a aparecer cuando visites otra página del sitio.
        </p>
      )}
    </div>
  );
}
