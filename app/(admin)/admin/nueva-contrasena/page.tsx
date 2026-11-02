import { AuthCard } from "@/features/auth/components/auth-card";
import { NewPasswordForm } from "@/features/auth/components/new-password-form";
import { adminHref } from "@/lib/admin-path";

export default function NewPasswordPage() {
  return (
    <AuthCard title="Contraseña nueva">
      <NewPasswordForm adminBase={adminHref()} />
    </AuthCard>
  );
}
