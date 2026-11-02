"use client";

import { type FormEvent, useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { totpCodeSchema } from "@/schemas/auth";
import { authFieldClass, FormError } from "./auth-card";

type Enrollment = { factorId: string; qrCode: string; secret: string };

/** Solo se acepta este destino: un parámetro libre permitiría redirecciones abiertas. */
function getDestination(adminBase: string, wantsPasswordChange: boolean) {
  return wantsPasswordChange ? `${adminBase}/nueva-contrasena` : adminBase;
}

type MfaFormProps = { adminBase: string; wantsPasswordChange: boolean };

export function MfaForm({ adminBase, wantsPasswordChange }: MfaFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedFactorId, setVerifiedFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFactors() {
      const supabase = createBrowserSupabase();
      const { data: level } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (level?.currentLevel === "aal2") {
        window.location.assign(getDestination(adminBase, wantsPasswordChange));
        return;
      }
      const { data } = await supabase.auth.mfa.listFactors();
      setVerifiedFactorId(data?.totp[0]?.id ?? null);
      setIsLoading(false);
    }
    void loadFactors();
  }, [adminBase, wantsPasswordChange]);

  async function startEnrollment() {
    setError(null);
    const supabase = createBrowserSupabase();

    // Un intento anterior sin terminar impediría registrar el factor nuevo.
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const pending = factors?.all.filter((factor) => factor.status === "unverified") ?? [];
    await Promise.all(pending.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (enrollError || !data) {
      setError("No se pudo iniciar la configuración. Inténtalo de nuevo.");
      return;
    }
    setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const factorId = enrollment?.factorId ?? verifiedFactorId;
    const code = totpCodeSchema.safeParse(new FormData(event.currentTarget).get("code"));
    if (!factorId) return;
    if (!code.success) {
      setError(code.error.issues[0]?.message ?? "Revisa el código.");
      return;
    }

    const { error: verifyError } = await createBrowserSupabase().auth.mfa.challengeAndVerify({
      factorId,
      code: code.data,
    });
    if (verifyError) {
      setError("Código incorrecto o vencido. Prueba con el código actual.");
      return;
    }

    window.location.assign(getDestination(adminBase, wantsPasswordChange));
  }

  if (isLoading) return <p className="text-sm text-muted">Cargando…</p>;

  if (!verifiedFactorId && !enrollment) {
    return (
      <div className="space-y-4">
        <FormError message={error} />
        <p className="text-sm text-ink-soft">
          Necesitas una aplicación de autenticación en tu celular, como Google Authenticator o
          Authy. Sin este paso no se puede entrar al panel.
        </p>
        <button
          type="button"
          onClick={startEnrollment}
          className={buttonClasses("primary", "md", "w-full")}
        >
          Configurar autenticador
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError message={error} />
      {enrollment && (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- QR en data: URI de Supabase */}
          <img
            src={enrollment.qrCode}
            alt="Código QR para la aplicación de autenticación"
            width={180}
            height={180}
            className="mx-auto rounded-xl bg-white p-2"
          />
          <p className="text-xs text-muted">
            Si no puedes escanearlo, escribe esta clave en la aplicación:{" "}
            <code className="break-all font-medium text-ink">{enrollment.secret}</code>
          </p>
        </div>
      )}
      <div>
        <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
          Código de 6 dígitos
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          pattern="[0-9]{6}"
          className={authFieldClass}
        />
      </div>
      <button type="submit" className={buttonClasses("primary", "md", "w-full")}>
        Verificar
      </button>
    </form>
  );
}
