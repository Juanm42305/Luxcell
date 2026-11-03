"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/cn";

/** Menú principal: marca la sección actual con un subrayado dorado. */
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="hidden lg:block">
      <ul className="flex gap-1">
        {navLinks.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center rounded-full px-3 text-sm transition-colors hover:bg-white/10 hover:text-white",
                  active ? "text-white" : "text-white/75",
                )}
              >
                {link.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-brand transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
