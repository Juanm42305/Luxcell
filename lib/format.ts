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

export function formatDate(isoDate: string): string {
  return longDate.format(new Date(isoDate));
}
