import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-medium text-muted">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">No encontramos esta página</h1>
        <p className="mt-2 text-muted">Es posible que el producto ya no esté publicado.</p>
        <ButtonLink href="/catalogo" className="mt-6">
          Ir al catálogo
        </ButtonLink>
      </div>
    </main>
  );
}
