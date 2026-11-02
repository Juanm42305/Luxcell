"use client";

import { type FormEvent, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { emailSchema } from "@/schemas/auth";
import { authFieldClass, FormError } from "./auth-card";

export function RecoveryForm() {
  const [error, setError] = useState<string | null>(null);
  const [wasSent, setWasSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = emailSchema.safeParse(new FormData(event.currentTarget).get("email"));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa el correo.");
      return;
    }

    await createBrowserSupabase().auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    // Siempre la misma respuesta: no revela si el correo está registrado.
    setWasSent(true);
  }

  if (wasSent) {
    return (
      <p role="status" className="text-sm text-ink-soft">
        Si el correo corresponde a una cuenta, recibirás un enlace para crear una contraseña nueva.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={error} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className={authFieldClass}
        />
      </div>
      <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
        Enviar enlace
      </button>
    </form>
  );
}
