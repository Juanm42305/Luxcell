import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { getBusinessSettings } from "@/services/settings";

export async function BrandMark({ className }: { className?: string }) {
  const { name, logoUrl } = await getBusinessSettings();

  return (
    <Link href="/" className={cn("flex min-h-11 min-w-0 items-center gap-2", className)}>
      {logoUrl ? (
        <Image src={logoUrl} alt="" width={36} height={36} className="size-9 object-contain" />
      ) : (
        <span
          aria-hidden
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-dashed border-current text-[9px] font-semibold"
        >
          LOGO
        </span>
      )}
      <span className="truncate text-sm font-semibold tracking-tight">{name}</span>
    </Link>
  );
}
