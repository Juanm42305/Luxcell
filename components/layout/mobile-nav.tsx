"use client";

import { House, LayoutGrid, type LucideIcon, MessageCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { buildGeneralMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { SiteSearch } from "./site-search";

const itemClass =
  "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(itemClass, active ? "text-ink" : "text-muted")}
    >
      <Icon aria-hidden className="size-5" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

/** Navegación inferior para móvil: las acciones principales quedan al alcance del pulgar. */
export function MobileNav({ whatsappNumber }: { whatsappNumber: string | null }) {
  const pathname = usePathname();
  const searchDialog = useRef<HTMLDialogElement>(null);
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, buildGeneralMessage());

  return (
    <>
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="grid grid-cols-4">
          <li>
            <NavItem href="/" label="Inicio" icon={House} active={pathname === "/"} />
          </li>
          <li>
            <NavItem
              href="/catalogo"
              label="Catálogo"
              icon={LayoutGrid}
              active={pathname.startsWith("/catalogo")}
            />
          </li>
          <li>
            <button
              type="button"
              onClick={() => searchDialog.current?.showModal()}
              className={cn(itemClass, "text-muted")}
            >
              <Search aria-hidden className="size-5" strokeWidth={1.8} />
              Buscar
            </button>
          </li>
          <li>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(itemClass, "text-whatsapp")}
              >
                <MessageCircle aria-hidden className="size-5" strokeWidth={2} />
                WhatsApp
              </a>
            ) : (
              <span
                className={cn(itemClass, "text-muted")}
                title="Número de WhatsApp pendiente de configurar"
              >
                <MessageCircle aria-hidden className="size-5" strokeWidth={1.8} />
                [WhatsApp]
              </span>
            )}
          </li>
        </ul>
      </nav>

      <dialog
        ref={searchDialog}
        aria-label="Buscar productos"
        className="m-0 w-full max-w-none rounded-b-3xl bg-surface p-4 pt-[max(1rem,env(safe-area-inset-top))] md:hidden"
      >
        <div className="flex items-center gap-2">
          <SiteSearch id="busqueda-movil" className="flex-1" autoFocus />
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={() => searchDialog.current?.close()}
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-ink/5"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
      </dialog>
    </>
  );
}
