import { getBusinessSettings } from "@/services/settings";

export async function DemoBanner() {
  const { isComplete } = await getBusinessSettings();
  if (isComplete) return null;
  return (
    <p className="bg-brand px-4 py-1.5 text-center text-xs font-medium text-ink">
      Sitio en preparación: algunos datos del negocio están pendientes.
    </p>
  );
}
