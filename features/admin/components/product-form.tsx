"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { conditionOptions } from "@/lib/product-labels";
import { toSlug } from "@/lib/slug";
import type { ActionState } from "../action-state";
import { useFormAction } from "../use-form-action";
import { ColorPicker } from "./color-picker";
import { CheckboxField, FormStatus, inputClass, SelectField, TextArea, TextField } from "./fields";

type Option = { value: string; label: string };

export type ProductFormValues = {
  name: string;
  slug: string;
  model: string;
  brand_id: string;
  category_id: string;
  short_description: string;
  description: string;
  price: number;
  sale_price: number | null;
  low_stock_threshold: number;
  condition: string;
  storage_capacity: string | null;
  colors: string[];
  specs: { label: string; value: string }[];
  warranty_terms: string | null;
  offer_valid_until: string | null;
  is_featured: boolean;
  is_active: boolean;
};

type ProductFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  brands: Option[];
  categories: Option[];
  initial?: ProductFormValues;
};

export function ProductForm({ action, brands, categories, initial }: ProductFormProps) {
  const { state, onSubmit, isPending } = useFormAction(action);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const errors = state.fieldErrors ?? {};
  const isNew = !initial;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FormStatus state={state} />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Información</legend>
        <div className="sm:col-span-2">
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={150}
            defaultValue={initial?.name}
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => {
              if (!slugTouched) setSlug(toSlug(event.target.value));
            }}
            className={`${inputClass} h-11`}
          />
          {errors.name && <p className="mt-1 text-xs font-medium text-warn">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm font-medium">
            Identificador en la dirección (slug)
          </label>
          <input
            id="slug"
            name="slug"
            required
            maxLength={120}
            value={slug}
            aria-invalid={Boolean(errors.slug)}
            aria-describedby="slug-hint"
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            className={`${inputClass} h-11`}
          />
          <p
            id="slug-hint"
            className={
              errors.slug ? "mt-1 text-xs font-medium text-warn" : "mt-1 text-xs text-muted"
            }
          >
            {errors.slug ?? `Se verá como /producto/${slug || "…"}`}
          </p>
        </div>
        <TextField
          name="model"
          label="Modelo"
          required
          maxLength={100}
          defaultValue={initial?.model}
          error={errors.model}
        />
        <SelectField
          name="brandId"
          label="Marca"
          options={brands}
          placeholder="Elige una marca"
          defaultValue={initial?.brand_id}
          error={errors.brandId}
          hint={brands.length === 0 ? "Primero crea una marca en la sección Marcas." : undefined}
        />
        <SelectField
          name="categoryId"
          label="Categoría"
          options={categories}
          placeholder="Elige una categoría"
          defaultValue={initial?.category_id}
          error={errors.categoryId}
        />
        <SelectField
          name="condition"
          label="Estado"
          options={conditionOptions}
          defaultValue={initial?.condition ?? "new"}
          error={errors.condition}
        />
        <TextField
          name="storageCapacity"
          label="Almacenamiento (opcional)"
          maxLength={40}
          defaultValue={initial?.storage_capacity}
          error={errors.storageCapacity}
          hint="Ej. 128 GB"
        />
        <ColorPicker name="colors" defaultValue={initial?.colors} error={errors.colors} />
        <TextArea
          className="sm:col-span-2"
          name="shortDescription"
          label="Descripción breve"
          rows={2}
          maxLength={300}
          defaultValue={initial?.short_description}
          error={errors.shortDescription}
          hint="Aparece en la tarjeta del catálogo."
        />
        <TextArea
          className="sm:col-span-2"
          name="description"
          label="Descripción completa"
          rows={6}
          maxLength={5000}
          defaultValue={initial?.description}
          error={errors.description}
        />
        <TextArea
          className="sm:col-span-2"
          name="specs"
          label="Especificaciones técnicas (opcional)"
          rows={5}
          maxLength={4000}
          defaultValue={initial?.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n")}
          error={errors.specs}
          hint="Una por línea, con la forma Nombre: valor. Ej. Pantalla: 6,1 pulgadas"
        />
        <TextArea
          className="sm:col-span-2"
          name="warrantyTerms"
          label="Condiciones de garantía"
          rows={3}
          maxLength={2000}
          defaultValue={initial?.warranty_terms}
          error={errors.warrantyTerms}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Precio e inventario</legend>
        <TextField
          name="price"
          label="Precio (COP, impuestos incluidos)"
          inputMode="numeric"
          required
          defaultValue={initial?.price}
          error={errors.price}
          hint="Solo números. Ej. 2500000"
        />
        <TextField
          name="salePrice"
          label="Precio en oferta (opcional)"
          inputMode="numeric"
          defaultValue={initial?.sale_price}
          error={errors.salePrice}
          hint="Menor que el precio normal. La web tacha el precio normal y muestra el descuento."
        />
        <TextField
          name="offerValidUntil"
          label="Oferta válida hasta (opcional)"
          type="date"
          defaultValue={initial?.offer_valid_until}
          error={errors.offerValidUntil}
          hint="Último día de la oferta. Muestra un contador y la oferta se quita sola al terminar."
        />
        {isNew && (
          <TextField
            name="initialStock"
            label="Existencias iniciales"
            inputMode="numeric"
            required
            defaultValue={0}
            error={errors.initialStock}
          />
        )}
        <TextField
          name="lowStockThreshold"
          label="Umbral de «Últimas unidades»"
          inputMode="numeric"
          required
          defaultValue={initial?.low_stock_threshold ?? 3}
          error={errors.lowStockThreshold}
          hint="Con esta cantidad o menos se muestra «Últimas unidades»."
        />
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Publicación</legend>
        <CheckboxField
          name="isActive"
          label="Visible en la web"
          defaultChecked={initial?.is_active ?? false}
          hint="Desmárcalo para ocultarlo sin borrarlo."
        />
        <CheckboxField
          name="isFeatured"
          label="Destacado en el inicio"
          defaultChecked={initial?.is_featured ?? false}
        />
      </fieldset>

      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
      >
        {isPending ? "Guardando…" : isNew ? "Crear producto" : "Guardar cambios"}
      </button>
    </form>
  );
}
