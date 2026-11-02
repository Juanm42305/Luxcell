"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { LEGAL_ACCEPTANCE_KEY, LEGAL_VERSION } from "../acceptance";

function hasAccepted() {
  try {
    return window.localStorage.getItem(LEGAL_ACCEPTANCE_KEY) === LEGAL_VERSION;
  } catch {
    return false;
  }
}

/** Caja de ingreso: el visitante acepta los términos y declara conocer las políticas. */
export function LegalAcceptanceDialog() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [knowsPolicies, setKnowsPolicies] = useState(false);

  // En las páginas legales no se muestra: el visitante debe poder leerlas antes de aceptar.
  useEffect(() => {
    if (pathname.startsWith("/legal") || hasAccepted()) {
      dialog.current?.close();
      return;
    }
    if (!dialog.current?.open) dialog.current?.showModal();
  }, [pathname]);

  function accept() {
    try {
      window.localStorage.setItem(LEGAL_ACCEPTANCE_KEY, LEGAL_VERSION);
    } catch {
      // Sin almacenamiento disponible se vuelve a preguntar en la próxima visita.
    }
    dialog.current?.close();
  }

  const linkClass = "font-medium text-brand underline underline-offset-2 hover:text-white";

  return (
    <dialog
      ref={dialog}
      aria-labelledby="titulo-aceptacion"
      // Escape no la cierra: hace falta aceptar.
      onCancel={(event) => event.preventDefault()}
      className="on-night m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-brand/40 bg-night p-6 text-white shadow-2xl sm:p-8"
    >
      <Image
        src="/brand/luxcell-emblema.webp"
        alt=""
        width={72}
        height={72}
        className="mx-auto size-18"
      />
      <h2 id="titulo-aceptacion" className="mt-4 text-center text-2xl font-semibold tracking-tight">
        Bienvenido a LUX CELL
      </h2>
      <p className="mt-2 text-center text-sm text-night-muted">
        Antes de continuar, revisa y acepta las condiciones de uso del sitio.
      </p>

      <div className="mt-6 space-y-3 text-sm">
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-night-line p-3 hover:border-night-muted">
          <input
            type="checkbox"
            checked={acceptsTerms}
            onChange={(event) => setAcceptsTerms(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-brand"
          />
          <span>
            He leído y acepto los{" "}
            <Link href="/legal/terminos" className={linkClass}>
              Términos y condiciones
            </Link>
            .
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-2xl border border-night-line p-3 hover:border-night-muted">
          <input
            type="checkbox"
            checked={knowsPolicies}
            onChange={(event) => setKnowsPolicies(event.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-brand"
          />
          <span>
            Conozco la{" "}
            <Link href="/legal/datos-personales" className={linkClass}>
              Política de tratamiento de datos personales
            </Link>
            , el{" "}
            <Link href="/legal/privacidad" className={linkClass}>
              Aviso de privacidad
            </Link>{" "}
            y la{" "}
            <Link href="/legal/cookies" className={linkClass}>
              Política de cookies
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={accept}
        disabled={!acceptsTerms || !knowsPolicies}
        className={buttonClasses("accent", "lg", "mt-6 w-full")}
      >
        Aceptar y continuar
      </button>
      <p className="mt-3 text-center text-xs text-night-muted">
        Navegar no implica entregar datos personales. Solo se te pedirá autorización si decides
        dejarnos tus datos de contacto.
      </p>
    </dialog>
  );
}
