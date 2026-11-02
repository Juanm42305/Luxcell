import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/** Formulario GET: funciona sin JavaScript y deja la búsqueda en la URL. */
export function SiteSearch({
  id,
  className,
  autoFocus,
}: {
  id: string;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/catalogo" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar por nombre o modelo
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        name="q"
        type="search"
        maxLength={80}
        autoFocus={autoFocus}
        placeholder="Buscar por nombre o modelo"
        className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-base transition-colors placeholder:text-muted hover:border-muted focus:border-ink focus:outline-none sm:text-sm"
      />
    </form>
  );
}
