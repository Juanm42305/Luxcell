"use client";

import { buttonClasses } from "@/components/ui/button";

/** Nunca muestra el detalle técnico: solo un mensaje y la opción de reintentar. */
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Algo no salió bien</h1>
        <p className="mt-2 text-muted">No pudimos cargar esta página. Inténtalo de nuevo.</p>
        <button type="button" onClick={reset} className={buttonClasses("primary", "md", "mt-6")}>
          Reintentar
        </button>
      </div>
    </main>
  );
}
