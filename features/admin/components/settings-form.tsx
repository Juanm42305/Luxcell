"use client";

import { buttonClasses } from "@/components/ui/button";
import type { ActionState } from "../action-state";
import { useFormAction } from "../use-form-action";
import { FormStatus, TextArea, TextField } from "./fields";

export type SettingsValues = {
  business_name: string | null;
  slogan: string | null;
  description: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  phone: string | null;
  business_address: string | null;
  legal_name: string | null;
  tax_id: string | null;
  judicial_address: string | null;
  sales_authorization: string | null;
  socialText: string;
  brandColor: string;
};

type SettingsFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: SettingsValues;
};

export function SettingsForm({ action, initial }: SettingsFormProps) {
  const { state, onSubmit, isPending } = useFormAction(action);
  const errors = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FormStatus state={state} />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Negocio</legend>
        <TextField
          name="businessName"
          label="Nombre comercial"
          required
          maxLength={120}
          defaultValue={initial.business_name}
          error={errors.businessName}
        />
        <TextField
          name="slogan"
          label="Eslogan (opcional)"
          maxLength={160}
          defaultValue={initial.slogan}
          error={errors.slogan}
        />
        <TextArea
          className="sm:col-span-2"
          name="description"
          label="Descripción general"
          rows={2}
          maxLength={1000}
          defaultValue={initial.description}
          error={errors.description}
        />
        <div>
          <label htmlFor="brandColor" className="mb-1.5 block text-sm font-medium">
            Color de marca
          </label>
          <input
            id="brandColor"
            name="brandColor"
            type="color"
            defaultValue={initial.brandColor}
            className="h-11 w-24 cursor-pointer rounded-xl border border-line bg-surface p-1"
          />
          {errors.brandColor && (
            <p className="mt-1 text-xs font-medium text-warn">{errors.brandColor}</p>
          )}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Contacto</legend>
        <TextField
          name="whatsappNumber"
          label="Número de WhatsApp"
          inputMode="numeric"
          defaultValue={initial.whatsapp_number}
          error={errors.whatsappNumber}
          hint="Con indicativo, sin + ni espacios. Ej. 573001234567"
        />
        <TextField
          name="phone"
          label="Teléfono visible"
          maxLength={30}
          defaultValue={initial.phone}
          error={errors.phone}
          hint="Ej. +57 300 123 4567"
        />
        <TextField
          name="contactEmail"
          label="Correo de atención"
          type="email"
          maxLength={254}
          defaultValue={initial.contact_email}
          error={errors.contactEmail}
        />
        <TextField
          name="businessAddress"
          label="Dirección comercial (opcional)"
          maxLength={200}
          defaultValue={initial.business_address}
          error={errors.businessAddress}
        />
        <TextArea
          className="sm:col-span-2"
          name="socialLinks"
          label="Redes sociales"
          rows={3}
          maxLength={2000}
          defaultValue={initial.socialText}
          error={errors.socialLinks}
          hint="Una por línea: Nombre | https://… Ej. Instagram | https://www.instagram.com/usuario/"
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Identificación legal</legend>
        <p className="text-sm text-muted sm:col-span-2">
          Se muestran en el pie de página y en los documentos legales. La Ley 1480 de 2011 exige
          publicarlos a quien vende por medios electrónicos.
        </p>
        <TextField
          name="legalName"
          label="Nombre o razón social"
          maxLength={160}
          defaultValue={initial.legal_name}
          error={errors.legalName}
        />
        <TextField
          name="taxId"
          label="NIT o número de identificación"
          maxLength={30}
          defaultValue={initial.tax_id}
          error={errors.taxId}
        />
        <TextField
          name="judicialAddress"
          label="Dirección de notificación"
          maxLength={200}
          defaultValue={initial.judicial_address}
          error={errors.judicialAddress}
        />
        <TextField
          name="salesAuthorization"
          label="Autorización de venta de equipos (AVETM)"
          maxLength={80}
          defaultValue={initial.sales_authorization}
          error={errors.salesAuthorization}
        />
      </fieldset>

      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses("primary", "lg", "w-full sm:w-auto")}
      >
        {isPending ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
