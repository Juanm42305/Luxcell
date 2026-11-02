import Link from "next/link";
import { Container } from "@/components/ui/container";
import { legalLinks, navLinks } from "@/config/site";
import { getBusinessSettings } from "@/services/settings";

export async function SiteFooter() {
  const settings = await getBusinessSettings();

  return (
    <footer className="on-night bg-night text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-semibold">{settings.name}</p>
          <p className="mt-2 text-sm text-night-muted">{settings.slogan}</p>
        </div>

        <nav aria-label="Enlaces del sitio">
          <h2 className="text-sm font-medium text-night-muted">Explorar</h2>
          <ul className="mt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-10 items-center text-sm hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información legal">
          <h2 className="text-sm font-medium text-night-muted">Legal</h2>
          <ul className="mt-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-10 items-center text-sm hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-medium text-night-muted">Redes sociales</h2>
          {settings.socialLinks.length > 0 ? (
            <ul className="mt-2">
              {settings.socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-10 items-center text-sm hover:underline"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm">[Redes sociales pendientes]</p>
          )}
        </div>
      </Container>

      <div className="border-t border-night-line">
        <Container className="py-6 text-xs leading-relaxed text-night-muted">
          <h2 className="sr-only">Identificación del proveedor</h2>
          <p>
            {settings.legalName} · NIT {settings.taxId} · {settings.judicialAddress} ·{" "}
            {settings.phone} · {settings.contactEmail}
          </p>
          <p className="mt-1">{settings.salesAuthorization}</p>
        </Container>
      </div>
    </footer>
  );
}
