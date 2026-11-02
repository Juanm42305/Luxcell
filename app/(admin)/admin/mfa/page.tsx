import { AuthCard } from "@/features/auth/components/auth-card";
import { MfaForm } from "@/features/auth/components/mfa-form";
import { adminHref } from "@/lib/admin-path";

type MfaPageProps = { searchParams: Promise<{ siguiente?: string }> };

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const { siguiente } = await searchParams;

  return (
    <AuthCard
      title="Verificación en dos pasos"
      description="Escribe el código de 6 dígitos de tu aplicación de autenticación."
    >
      <MfaForm adminBase={adminHref()} wantsPasswordChange={siguiente === "contrasena"} />
    </AuthCard>
  );
}
