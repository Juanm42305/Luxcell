"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { toSlug } from "@/lib/slug";
import type { ActionState } from "../action-state";
import { useFormAction } from "../use-form-action";
import { ConfirmButton } from "./confirm-button";
import { CheckboxField, FormStatus, inputClass, TextField } from "./fields";

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  description?: string | null;
  display_order?: number;
};

type TaxonomyEditorProps = {
  item?: TaxonomyItem;
  kind: "category" | "brand";
  save: (state: ActionState, formData: FormData) => Promise<ActionState>;
  remove?: () => Promise<ActionState>;
};

/** Formulario de una categoría o marca. Sin `item`, crea una nueva. */
export function TaxonomyEditor({ item, kind, save, remove }: TaxonomyEditorProps) {
  const { state, onSubmit, isPending } = useFormAction(save);
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const errors = state.fieldErrors ?? {};
  const prefix = item?.id ?? "nuevo";

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <FormStatus state={state} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${prefix}-name`} className="mb-1.5 block text-sm font-medium">
              Nombre
            </label>
            <input
              id={`${prefix}-name`}
              name="name"
              required
              maxLength={80}
              defaultValue={item?.name}
              onChange={(event) => {
                if (!slugTouched) setSlug(toSlug(event.target.value));
              }}
              className={`${inputClass} h-11`}
            />
            {errors.name && <p className="mt-1 text-xs font-medium text-warn">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor={`${prefix}-slug`} className="mb-1.5 block text-sm font-medium">
              Identificador (slug)
            </label>
            <input
              id={`${prefix}-slug`}
              name="slug"
              required
              maxLength={120}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className={`${inputClass} h-11`}
            />
            {errors.slug && <p className="mt-1 text-xs font-medium text-warn">{errors.slug}</p>}
          </div>
          {kind === "category" && (
            <>
              <TextField
                name="description"
                label="Descripción (opcional)"
                maxLength={500}
                defaultValue={item?.description}
                error={errors.description}
              />
              <TextField
                name="displayOrder"
                label="Orden en el inicio"
                inputMode="numeric"
                defaultValue={item?.display_order ?? 0}
                error={errors.displayOrder}
              />
            </>
          )}
        </div>
        <CheckboxField
          name="isActive"
          label="Visible en la web"
          defaultChecked={item?.is_active ?? true}
        />
        <div className="flex flex-wrap items-start gap-2">
          <button type="submit" disabled={isPending} className={buttonClasses("primary")}>
            {isPending ? "Guardando…" : item ? "Guardar" : "Crear"}
          </button>
          {remove && (
            <ConfirmButton
              action={remove}
              label="Eliminar"
              confirmText="Solo se puede eliminar si ningún producto la usa. Si no, desactívala."
            />
          )}
        </div>
      </form>
    </div>
  );
}
