"use client";

import { FolderTree, LayoutDashboard, Package, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { path: "", label: "Resumen", icon: LayoutDashboard },
  { path: "/productos", label: "Productos", icon: Package },
  { path: "/categorias", label: "Categorías", icon: FolderTree },
  { path: "/marcas", label: "Marcas", icon: Tags },
  { path: "/configuracion", label: "Configuración", icon: Settings },
];

export function AdminNav({ adminBase }: { adminBase: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex gap-1 lg:flex-col">
        {items.map(({ path, label, icon: Icon }) => {
          const href = `${adminBase}${path}`;
          const active = path === "" ? pathname === adminBase : pathname.startsWith(href);
          return (
            <li key={path} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors",
                  active ? "bg-brand text-ink" : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
