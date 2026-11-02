import { MessageCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type WhatsAppLinkProps = {
  phoneNumber: string | null;
  message: string;
  label: string;
  /** Texto accesible cuando el mismo botón se repite para varios productos. */
  accessibleLabel?: string;
  /** "quiet" se usa para acciones que no deben parecer una compra, como los productos agotados. */
  tone?: "solid" | "quiet";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function WhatsAppLink({
  phoneNumber,
  message,
  label,
  accessibleLabel,
  tone = "solid",
  size = "md",
  className,
}: WhatsAppLinkProps) {
  const url = buildWhatsAppUrl(phoneNumber, message);
  const variant = tone === "solid" ? "whatsapp" : "secondary";

  // Sin número configurado no hay enlace: nunca se inventa un destino.
  if (!url) {
    return (
      <span
        title="Número de WhatsApp pendiente de configurar"
        className={buttonClasses(variant, size, className)}
      >
        <MessageCircle aria-hidden className="size-4 shrink-0" />
        {label}
        <span className="sr-only"> (número de WhatsApp pendiente de configurar)</span>
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      className={buttonClasses(variant, size, className)}
    >
      <MessageCircle aria-hidden className="size-4 shrink-0" />
      {label}
    </a>
  );
}
