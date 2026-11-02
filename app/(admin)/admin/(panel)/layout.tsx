import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { signOut } from "@/features/auth/actions";
import { requireAdmin } from "@/services/admin-session";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const { email } = await requireAdmin();

  return (
    <>
      <header className="border-b border-line bg-surface">
        <Container className="flex h-16 items-center justify-between gap-4">
          <p className="truncate text-sm font-medium">{email}</p>
          <form action={signOut}>
            <button type="submit" className={buttonClasses("secondary")}>
              Cerrar sesión
            </button>
          </form>
        </Container>
      </header>
      <main>{children}</main>
    </>
  );
}
