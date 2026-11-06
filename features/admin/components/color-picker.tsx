"use client";

import { Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { MAX_COLOR_LENGTH, MAX_COLORS, suggestedColors } from "@/lib/product-labels";
import { inputClass } from "./fields";

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const sameColor = (a: string, b: string) => a.toLocaleLowerCase("es") === b.toLocaleLowerCase("es");

/**
 * Selección de varios colores: sugerencias de un clic y un campo para escribir cualquier otro.
 * Se envía como un solo campo oculto, un color por línea.
 */
export function ColorPicker({
  name,
  defaultValue = [],
  error,
}: {
  name: string;
  defaultValue?: string[];
  error?: string;
}) {
  const [colors, setColors] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");
  const inputId = useId();
  const full = colors.length >= MAX_COLORS;
  const has = (color: string) => colors.some((current) => sameColor(current, color));

  function add(value: string) {
    const color = normalize(value).slice(0, MAX_COLOR_LENGTH);
    if (!color || has(color) || full) return;
    setColors((current) => [...current, color]);
  }

  function remove(color: string) {
    setColors((current) => current.filter((item) => !sameColor(item, color)));
  }

  return (
    <div className="sm:col-span-2">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        Colores disponibles (opcional)
      </label>
      <input type="hidden" name={name} value={colors.join("\n")} />

      <div
        className={cn(
          "rounded-xl border bg-surface p-2",
          error ? "border-warn" : "border-line focus-within:border-ink",
        )}
      >
        {colors.length > 0 && (
          <ul aria-label="Colores elegidos" className="mb-2 flex flex-wrap gap-1.5">
            {colors.map((color) => (
              <li key={color}>
                <span className="inline-flex items-center gap-1 rounded-full bg-ink py-1 pr-1 pl-3 text-sm text-white">
                  {color}
                  <button
                    type="button"
                    onClick={() => remove(color)}
                    aria-label={`Quitar ${color}`}
                    className="grid size-6 place-items-center rounded-full hover:bg-white/20"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            id={inputId}
            value={draft}
            maxLength={MAX_COLOR_LENGTH}
            disabled={full}
            placeholder={full ? `Máximo ${MAX_COLORS} colores` : "Escribe un color y pulsa Enter"}
            aria-describedby={`${inputId}-hint`}
            aria-invalid={Boolean(error)}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                add(draft);
                setDraft("");
              } else if (event.key === "Backspace" && !draft && colors.length > 0) {
                remove(colors[colors.length - 1]!);
              }
            }}
            className={cn(inputClass, "h-10 border-transparent hover:border-transparent")}
          />
          <button
            type="button"
            disabled={!normalize(draft) || full}
            onClick={() => {
              add(draft);
              setDraft("");
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-line px-3 text-sm font-medium transition-colors hover:border-ink disabled:opacity-40"
          >
            <Plus aria-hidden className="size-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Colores sugeridos" role="group">
        {suggestedColors
          .filter((color) => !has(color))
          .map((color) => (
            <button
              key={color}
              type="button"
              disabled={full}
              onClick={() => add(color)}
              aria-label={`Agregar ${color}`}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-xs transition-colors hover:border-ink disabled:opacity-40"
            >
              <Plus aria-hidden className="size-3" />
              {color}
            </button>
          ))}
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-warn">{error}</p>
      ) : (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted">
          Elige todos los colores en que tienes el producto. Toca una sugerencia o escribe otro.
        </p>
      )}
    </div>
  );
}
