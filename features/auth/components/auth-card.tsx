import type { ReactNode } from "react";

export const authFieldClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-base transition-colors hover:border-muted focus:border-ink focus:outline-none sm:text-sm";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-warn-soft px-3 py-2 text-sm text-warn">
      {message}
    </p>
  );
}
