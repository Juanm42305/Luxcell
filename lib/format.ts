const copNumber = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

const longDate = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

/** Ejemplo: 2500000 -> "$2.500.000 COP" */
export function formatCop(amount: number): string {
  return `$${copNumber.format(amount)} COP`;
}

/**
 * Muestra un celular colombiano con indicativo: "573203164287" o "3203164287" ->
 * "+57 320 316 4287". Cualquier otro formato se deja tal como se escribió.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("57") ? digits.slice(2) : digits;
  if (local.length === 10 && local.startsWith("3")) {
    return `+57 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone.trim();
}

export function formatDate(isoDate: string): string {
  return longDate.format(new Date(isoDate));
}
