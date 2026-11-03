import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { defaultLogo } from "@/config/site";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { signOut } from "@/features/auth/actions";
import { adminHref } from "@/lib/admin-path";
import { requireAdmin } from "@/services/admin-session";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="on-night sticky top-0 z-30 bg-night px-4 py-3 text-white lg:h-dvh lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:justify-center lg:border-b lg:border-night-line lg:pb-6">
          <Image
            src={defaultLogo.src}
            alt="LUX CELL"
            width={defaultLogo.width}
            height={defaultLogo.height}
            className="h-8 w-auto lg:h-10"
          />
          <form action={signOut} className="lg:hidden">
            <button type="submit" className="min-h-11 text-sm text-white/80 hover:text-white">
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="mt-3 lg:mt-8">
          <AdminNav adminBase={adminHref()} />
        </div>
        <div className="mt-8 hidden space-y-3 border-t border-night-line pt-6 text-center lg:block">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 px-3 text-sm text-white/80 hover:text-white"
          >
            <ExternalLink aria-hidden className="size-4" />
            Ver la web
          </a>
          <p className="truncate px-3 text-xs text-night-muted">{email}</p>
          <form action={signOut} className="px-3">
            <button type="submit" className={buttonClasses("inverse", "md", "w-full")}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
