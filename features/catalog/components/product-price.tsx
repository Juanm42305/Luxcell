"use client";

import { BadgePercent, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { formatCop } from "@/lib/format";
import { discountPercent, formatTimeLeft, offerEndsAt, timeLeft } from "@/lib/offer";

type Offer = {
  priceCop: number;
  salePriceCop: number | null;
  offerValidUntil: string | null;
};

const lastDayFormat = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Bogota",
});

/*
 * La hora actual solo se lee en el navegador, después de montar: así el servidor y el cliente
 * pintan lo mismo y la página puede seguir en caché. La base de datos ya oculta las ofertas
 * vencidas; esto cubre la que vence mientras alguien tiene la página abierta.
 */
function useOffer({ priceCop, salePriceCop, offerValidUntil }: Offer) {
  const endsAt = offerEndsAt(offerValidUntil);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (salePriceCop === null || endsAt === null) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [salePriceCop, endsAt]);

  const left = endsAt !== null && now !== null ? timeLeft(endsAt, now) : null;
  const expired = endsAt !== null && now !== null && left === null;
  const active = salePriceCop !== null && salePriceCop < priceCop && !expired;

  return {
    active,
    salePriceCop: salePriceCop ?? priceCop,
    percent: salePriceCop === null ? 0 : discountPercent(priceCop, salePriceCop),
    endsAt,
    left,
  };
}

export function OfferBadge({ className, ...offer }: Offer & { className?: string }) {
  const { active, percent } = useOffer(offer);
  if (!active) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-ink shadow-sm",
        className,
      )}
    >
      <BadgePercent aria-hidden className="size-3.5" />
      {percent > 0 ? (
        <>
          <span className="sr-only">Descuento del </span>−{percent} %
        </>
      ) : (
        "Oferta"
      )}
    </span>
  );
}

export function ProductPrice({
  size = "card",
  className,
  ...offer
}: Offer & { size?: "card" | "page"; className?: string }) {
  const { active, salePriceCop, endsAt, left } = useOffer(offer);
  const isPage = size === "page";
  const priceClass = isPage
    ? "text-2xl font-semibold tracking-tight tabular-nums"
    : "text-[15px] font-semibold tracking-tight tabular-nums sm:text-lg";

  if (!active) {
    return <p className={cn(priceClass, className)}>{formatCop(offer.priceCop)}</p>;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className={priceClass}>
          <span className="sr-only">Precio en oferta: </span>
          {formatCop(salePriceCop)}
        </p>
        <p className={cn("text-muted tabular-nums", isPage ? "text-base" : "text-xs sm:text-sm")}>
          <span className="sr-only">Precio normal: </span>
          <del>{formatCop(offer.priceCop)}</del>
        </p>
      </div>

      {endsAt !== null && (
        <p
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-ink font-medium whitespace-nowrap text-white",
            isPage ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-[11px] sm:text-xs",
          )}
        >
          <Clock aria-hidden className={isPage ? "size-4" : "size-3"} />
          {!isPage && (
            <span className="sr-only">
              Oferta válida hasta el {lastDayFormat.format(new Date(endsAt))}.
            </span>
          )}
          <span aria-hidden>
            {/* En la tarjeta del celular no cabe la frase: basta el reloj y el tiempo. */}
            <span className={isPage ? undefined : "max-sm:hidden"}>Termina en </span>
            <span className="inline-block min-w-[7ch] tabular-nums">
              {left ? formatTimeLeft(left) : "··:··:··"}
            </span>
          </span>
        </p>
      )}

      {isPage && endsAt !== null && (
        <p className="mt-2 text-xs text-muted">
          Oferta válida hasta el {lastDayFormat.format(new Date(endsAt))} o hasta agotar
          existencias.
        </p>
      )}
    </div>
  );
}
