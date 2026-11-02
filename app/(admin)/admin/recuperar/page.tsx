import { AuthCard } from "@/features/auth/components/auth-card";
import { RecoveryForm } from "@/features/auth/components/recovery-form";

export default function RecoverPasswordPage() {
  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Te enviaremos un enlace para crear una contraseña nueva."
    >
      <RecoveryForm />
    </AuthCard>
  );
}
