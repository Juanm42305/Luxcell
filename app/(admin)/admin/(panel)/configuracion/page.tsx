import Image from "next/image";
import { publishLogo, removeLogo, saveSettings } from "@/features/admin/actions/settings";
import { ConfirmButton } from "@/features/admin/components/confirm-button";
import { ImageUploader } from "@/features/admin/components/image-uploader";
import { SettingsForm } from "@/features/admin/components/settings-form";
import { defaultLogo } from "@/config/site";
import { parseBrandColor, parseSocialLinks } from "@/schemas/business-settings";
import { getAdminSettings } from "@/services/admin-catalog";

export default async function AdminSettingsPage() {
  const { settings, logoUrl } = await getAdminSettings();
  const socialText = parseSocialLinks(settings.social_media)
    .map((link) => `${link.label} | ${link.href}`)
    .join("\n");

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Configuración</h1>

      <section aria-labelledby="titulo-logo" className="mt-8">
        <h2 id="titulo-logo" className="text-lg font-semibold">
          Logo
        </h2>
        <div className="on-night mt-3 inline-flex rounded-2xl bg-night p-4">
          <Image
            src={logoUrl ?? defaultLogo.src}
            alt="Logo actual"
            width={defaultLogo.width}
            height={defaultLogo.height}
            className="h-12 w-auto"
          />
        </div>
        <p className="mt-2 text-sm text-muted">
          {logoUrl ? "Logo personalizado." : "Se usa el logo oficial incluido en la web."} Usa un
          PNG o WebP horizontal con fondo transparente o negro.
        </p>
        <div className="mt-4 space-y-3">
          <ImageUploader label="Elegir un logo nuevo" multiple={false} publish={publishLogo} />
          {logoUrl && (
            <ConfirmButton
              action={removeLogo}
              label="Volver al logo predeterminado"
              confirmText="Se eliminará el logo personalizado."
            />
          )}
        </div>
      </section>

      <section aria-labelledby="titulo-datos-negocio" className="mt-12">
        <h2 id="titulo-datos-negocio" className="sr-only">
          Datos del negocio
        </h2>
        <SettingsForm
          action={saveSettings}
          initial={{
            ...settings,
            socialText,
            brandColor: parseBrandColor(settings.brand_colors) ?? "#FFDC08",
          }}
        />
      </section>
    </div>
  );
}
