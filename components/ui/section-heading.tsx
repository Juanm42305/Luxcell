import { ArrowRight } from "lucide-react";
import Link from "next/link";

type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
};

export function SectionHeading({ id, eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        {eyebrow && <p className="mb-1.5 text-sm font-medium text-brand">{eyebrow}</p>}
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="group flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium"
        >
          {action.label}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-200 ease-soft group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}
