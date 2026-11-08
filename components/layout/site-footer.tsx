import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { legalLinks, navLinks } from "@/config/site";
import { cn } from "@/lib/cn";
import { getBusinessSettings } from "@/services/settings";

const footerLinkClass = "flex min-h-10 items-center text-sm text-white/85 hover:text-brand";

export async function SiteFooter() {
  const settings = await getBusinessSettings();
  const contact = [settings.legalName, settings.taxId && `NIT ${settings.taxId}`, settings.phone]
    .concat([settings.contactEmail, settings.judicialAddress, settings.salesAuthorization])
    .filter(Boolean);

  return (
    <footer className="on-night reveal border-t border-night-line bg-night text-white">
      <Container
        className={cn(
          "grid gap-10 py-12 sm:grid-cols-2",
          settings.socialLinks.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/luxcell-emblema.webp"
            alt={settings.name}
            width={96}
            height={96}
            className="size-24"
          />
          {settings.description && (
            <p className="mt-4 max-w-56 text-sm font-semibold text-brand">{settings.description}</p>
          )}
        </div>

        <nav aria-label="Enlaces del sitio">
          <h2 className="text-sm font-medium text-night-muted">Explorar</h2>
          <ul className="mt-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
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
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {settings.socialLinks.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-night-muted">Síguenos</h2>
            <ul className="mt-2">
              {settings.socialLinks.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>

      <div className="border-t border-night-line">
        <Container className="py-6 text-xs leading-relaxed text-night-muted">
          <h2 className="sr-only">Identificación del proveedor</h2>
          <p>
            © {new Date().getFullYear()} {settings.name}
            {contact.length > 0 && ` · ${contact.join(" · ")}`}
          </p>
          <p className="mt-2">
            Las marcas y logos de terceros pertenecen a sus titulares y se usan solo para
            identificar productos. El robot de Android se reproduce a partir de trabajo creado y
            compartido por Google, según la licencia{" "}
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand"
            >
              Creative Commons Atribución 3.0
            </a>
            .
          </p>
        </Container>
      </div>
    </footer>
  );
}
