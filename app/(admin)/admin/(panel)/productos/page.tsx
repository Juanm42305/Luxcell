import { Plus } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { StockBadge } from "@/features/catalog/components/stock-badge";
import { adminHref } from "@/lib/admin-path";
import { formatCop } from "@/lib/format";
import { listAdminProducts } from "@/services/admin-catalog";

type ProductsPageProps = { searchParams: Promise<{ q?: string; eliminado?: string }> };

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const { q, eliminado } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 80) : "";
  const products = await listAdminProducts();
  // El filtrado se hace en el servidor sobre la lista ya cargada: el texto no viaja a la consulta.
  const visible = query
    ? products.filter((p) => normalize(`${p.name} ${p.model}`).includes(normalize(query)))
    : products;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Productos</h1>
        <ButtonLink href={adminHref("/productos/nuevo")} variant="accent">
          <Plus aria-hidden className="size-4" />
          Nuevo producto
        </ButtonLink>
      </div>

      {eliminado && (
        <p role="status" className="mt-4 rounded-xl bg-ok-soft px-3 py-2 text-sm text-ok">
          Producto eliminado.
        </p>
      )}

      <form className="mt-6" role="search">
        <label htmlFor="buscar-producto" className="sr-only">
          Buscar producto
        </label>
        <input
          id="buscar-producto"
          name="q"
          type="search"
          defaultValue={query}
          maxLength={80}
          placeholder="Buscar por nombre o modelo"
          className="h-11 w-full max-w-sm rounded-full border border-line bg-surface px-4 text-base focus:border-ink focus:outline-none sm:text-sm"
        />
      </form>

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          {products.length === 0
            ? "Aún no hay productos."
            : "Ningún producto coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {visible.map((product) => (
            <li key={product.id}>
              <Link
                href={adminHref(`/productos/${product.id}`)}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-paper"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{product.name}</span>
                  <span className="block text-xs text-muted">
                    {product.brands?.name} · {product.categories?.name} · {product.model}
                  </span>
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCop(product.price)}
                </span>
                <span className="text-sm tabular-nums text-muted">
                  {product.stock_quantity} und.
                </span>
                <StockBadge status={product.stockStatus} />
                {!product.is_active && (
                  <span className="rounded-full bg-off-soft px-2.5 py-1 text-xs font-medium text-off">
                    Oculto
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
