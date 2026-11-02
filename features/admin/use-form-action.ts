"use client";

import { type FormEvent, useActionState, useTransition } from "react";
import { type ActionState, idleState } from "./action-state";

/**
 * Envía el formulario a una acción del servidor sin el reinicio automático de React 19: si la
 * validación falla, lo que el usuario escribió se conserva.
 */
export function useFormAction(
  action: (state: ActionState, formData: FormData) => Promise<ActionState>,
) {
  const [state, dispatch, isActionPending] = useActionState(action, idleState);
  const [isTransitionPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, onSubmit, isPending: isActionPending || isTransitionPending };
}
