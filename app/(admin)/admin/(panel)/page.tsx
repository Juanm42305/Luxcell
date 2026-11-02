import { Container } from "@/components/ui/container";
import { getDashboardStats } from "@/services/admin-dashboard";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Productos", value: stats.total },
    { label: "Disponibles", value: stats.available },
    { label: "Pocas unidades", value: stats.lowStock },
    { label: "Agotados", value: stats.outOfStock },
    { label: "Consultas recibidas", value: stats.inquiries },
  ];

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Resumen</h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-surface p-4">
            <dt className="text-sm text-muted">{card.label}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
              {card.value}
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
