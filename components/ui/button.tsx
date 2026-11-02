import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-center font-medium transition-[background-color,border-color,color,transform] duration-200 ease-soft active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  secondary: "border border-line bg-surface text-ink hover:border-ink",
  // Dorado de marca con texto negro: contraste de sobra en fondo claro y oscuro.
  accent: "bg-brand text-ink hover:bg-brand-strong",
  ghost: "text-ink hover:bg-ink/5",
  inverse: "bg-white text-ink hover:bg-white/85",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-xs leading-tight sm:px-5 sm:text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
