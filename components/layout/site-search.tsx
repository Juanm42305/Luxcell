import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type SiteSearchProps = {
  id: string;
  className?: string;
  tone?: "light" | "dark";
};

/** Formulario GET: funciona sin JavaScript y deja la búsqueda en la URL. */
export function SiteSearch({ id, className, tone = "light" }: SiteSearchProps) {
  return (
    <form action="/catalogo" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Buscar por nombre o modelo
      </label>
      <Search
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2",
          tone === "dark" ? "text-night-muted" : "text-muted",
        )}
      />
      <input
        id={id}
        name="q"
        type="search"
        maxLength={80}
        placeholder="Buscar por nombre o modelo"
        className={cn(
          "h-11 w-full rounded-full border pr-4 pl-10 text-base transition-colors focus:outline-none sm:text-sm",
          tone === "dark"
            ? "border-night-line bg-night-soft text-white placeholder:text-night-muted hover:border-night-muted focus:border-brand"
            : "border-line bg-surface placeholder:text-muted hover:border-muted focus:border-ink",
        )}
      />
    </form>
  );
}
