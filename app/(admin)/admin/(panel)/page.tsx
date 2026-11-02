import Link from "next/link";
import { adminHref } from "@/lib/admin-path";
import { formatDate } from "@/lib/format";
import { getDashboardStats } from "@/services/admin-dashboard";
import { getRecentActivity } from "@/services/admin-catalog";

export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([getDashboardStats(), getRecentActivity()]);

  const cards = [
    { label: "Productos", value: stats.total },
    { label: "Disponibles", value: stats.available },
    { label: "Pocas unidades", value: stats.lowStock },
    { label: "Agotados", value: stats.outOfStock },
    { label: "Consultas recibidas", value: stats.inquiries },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-semibold tracking-tight">Resumen</h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-surface p-4">
            <dt className="text-sm text-muted">{card.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {card.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="titulo-ultimos">
          <h2 id="titulo-ultimos" className="text-lg font-semibold">
            Últimos productos agregados
          </h2>
          {activity.latestProducts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Aún no hay productos.{" "}
              <Link href={adminHref("/productos/nuevo")} className="font-medium text-ink underline">
                Crear el primero
              </Link>
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
              {activity.latestProducts.map((product) => (
                <li key={product.id}>
                  <Link
                    href={adminHref(`/productos/${product.id}`)}
                    className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-paper"
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="shrink-0 text-muted">{formatDate(product.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-movimientos">
          <h2 id="titulo-movimientos" className="text-lg font-semibold">
            Últimos cambios de inventario
          </h2>
          {activity.latestMovements.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Sin movimientos todavía.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
              {activity.latestMovements.map((movement) => (
                <li key={movement.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{movement.product_name_snapshot}</span>
                    <span
                      className={
                        movement.quantity_delta < 0
                          ? "font-medium text-warn"
                          : "font-medium text-ok"
                      }
                    >
                      {movement.quantity_delta > 0 ? "+" : ""}
                      {movement.quantity_delta} → {movement.resulting_quantity}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(movement.created_at)}
                    {movement.reason && ` · ${movement.reason}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
