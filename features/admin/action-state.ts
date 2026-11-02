import type { FieldErrors } from "@/schemas/admin";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
};

export const idleState: ActionState = { status: "idle" };

/** Traduce errores de la base de datos sin revelar detalles internos. */
export function databaseErrorMessage(code: string | undefined): string {
  switch (code) {
    case "23505":
      return "Ya existe un registro con ese identificador (slug) o nombre.";
    case "23503":
      return "No se puede eliminar: hay productos que lo usan. Desactívalo o cambia esos productos primero.";
    case "23514":
      return "Algún valor está fuera de los límites permitidos.";
    case "42501":
      return "No tienes permiso para esta acción. Vuelve a iniciar sesión.";
    default:
      return "No se pudo guardar. Inténtalo de nuevo.";
  }
}
