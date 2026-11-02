"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { loginSchema } from "@/schemas/auth";
import { authFieldClass, FormError } from "./auth-card";

export function LoginForm({ adminBase }: { adminBase: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos.");
      return;
    }

    setIsPending(true);
    const { error: signInError } = await createBrowserSupabase().auth.signInWithPassword(
      parsed.data,
    );

    if (signInError) {
      // El mismo mensaje en todos los casos: no revela si el correo existe.
      setError(
        signInError.status === 429
          ? "Demasiados intentos. Espera unos minutos."
          : "Correo o contraseña incorrectos.",
      );
      setIsPending(false);
      return;
    }

    router.replace(`${adminBase}/mfa`);
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
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={authFieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className={buttonClasses("primary", "md", "w-full")}
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
      <Link
        href={`${adminBase}/recuperar`}
        className="flex min-h-11 items-center justify-center text-sm font-medium hover:underline"
      >
        Olvidé mi contraseña
      </Link>
    </form>
  );
}
