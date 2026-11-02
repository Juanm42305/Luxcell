import { AuthCard } from "@/features/auth/components/auth-card";
import { MfaForm } from "@/features/auth/components/mfa-form";

type MfaPageProps = { searchParams: Promise<{ siguiente?: string }> };

export default async function MfaPage({ searchParams }: MfaPageProps) {
  const { siguiente } = await searchParams;

  return (
    <AuthCard
      title="Verificación en dos pasos"
      description="Escribe el código de tu aplicación de autenticación."
    >
      <MfaForm wantsPasswordChange={siguiente === "contrasena"} />
    </AuthCard>
  );
}
