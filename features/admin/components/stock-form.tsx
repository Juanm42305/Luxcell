"use client";

import { buttonClasses } from "@/components/ui/button";
import type { ActionState } from "../action-state";
import { useFormAction } from "../use-form-action";
import { FormStatus, TextField } from "./fields";

type StockFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  currentQuantity: number;
};

export function StockForm({ action, currentQuantity }: StockFormProps) {
  const { state, onSubmit, isPending } = useFormAction(action);
  const errors = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormStatus state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="quantity"
          label="Existencias actuales"
          inputMode="numeric"
          required
          defaultValue={currentQuantity}
          error={errors.quantity}
          hint="Escribe la cantidad real disponible. 0 lo marca como agotado."
        />
        <TextField
          name="reason"
          label="Motivo (opcional)"
          maxLength={200}
          error={errors.reason}
          hint="Ej. Venta por WhatsApp, llegada de mercancía."
        />
      </div>
      <button type="submit" disabled={isPending} className={buttonClasses("primary")}>
        {isPending ? "Actualizando…" : "Actualizar existencias"}
      </button>
    </form>
  );
}
