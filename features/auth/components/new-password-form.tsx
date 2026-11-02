"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { newPasswordSchema } from "@/schemas/auth";
import { authFieldClass, FormError } from "./auth-card";

export function NewPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Con un segundo factor activo, cambiar la contraseña exige haberlo verificado antes.
  useEffect(() => {
    void createBrowserSupabase()
      .auth.mfa.getAuthenticatorAssuranceLevel()
      .then(({ data }) => {
        if (data?.nextLevel === "aal2" && data.currentLevel !== "aal2") {
          router.replace("/admin/mfa?siguiente=contrasena");
        }
      });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = newPasswordSchema.safeParse(new FormData(event.currentTarget).get("password"));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa la contraseña.");
      return;
    }

    const { error: updateError } = await createBrowserSupabase().auth.updateUser({
      password: parsed.data,
    });
    if (updateError) {
      setError("No se pudo cambiar la contraseña. Solicita un enlace nuevo.");
      return;
    }

    router.replace("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={error} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña nueva
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          aria-describedby="password-help"
          className={authFieldClass}
        />
        <p id="password-help" className="mt-1.5 text-xs text-muted">
          Mínimo 12 caracteres, con mayúscula, minúscula y número.
        </p>
      </div>
      <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
        Guardar contraseña
      </button>
    </form>
  );
}
