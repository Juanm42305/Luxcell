import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { adminHref } from "@/lib/admin-path";

export default function LoginPage() {
  return (
    <AuthCard title="Panel administrativo">
      <LoginForm adminBase={adminHref()} />
    </AuthCard>
  );
}
