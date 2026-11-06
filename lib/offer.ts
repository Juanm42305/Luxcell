/*
 * Ofertas. La fecha de fin es el último día de la oferta en hora de Colombia (UTC-5, sin horario
 * de verano): la oferta termina a las 23:59:59 de ese día.
 */

/** Instante exacto en que termina la oferta, en milisegundos. null si no tiene fecha de fin. */
export function offerEndsAt(lastDay: string | null): number | null {
  if (!lastDay || !/^\d{4}-\d{2}-\d{2}$/.test(lastDay)) return null;
  return Date.parse(`${lastDay}T23:59:59.999-05:00`);
}

/**
 * Porcentaje de descuento redondeado hacia abajo, para no anunciar más de lo real.
 * Devuelve 0 si la rebaja no llega al 1 %.
 */
export function discountPercent(price: number, salePrice: number): number {
  if (price <= 0 || salePrice >= price) return 0;
  return Math.floor(((price - salePrice) / price) * 100);
}

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

export function timeLeft(endsAt: number, now: number): TimeLeft | null {
  const total = Math.floor((endsAt - now) / 1000);
  if (total < 0) return null;
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Ejemplo: "2 d 05:12:09" o "05:12:09" en el último día. */
export function formatTimeLeft({ days, hours, minutes, seconds }: TimeLeft): string {
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days} d ${clock}` : clock;
}
