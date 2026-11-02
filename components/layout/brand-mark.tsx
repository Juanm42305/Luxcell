import Image from "next/image";
import Link from "next/link";
import { defaultLogo } from "@/config/site";
import { cn } from "@/lib/cn";
import { getBusinessSettings } from "@/services/settings";

export async function BrandMark({ className }: { className?: string }) {
  const { name, logoUrl } = await getBusinessSettings();

  return (
    <Link href="/" className={cn("flex min-h-11 shrink-0 items-center", className)}>
      <Image
        src={logoUrl ?? defaultLogo.src}
        alt={`${name}, ir al inicio`}
        width={defaultLogo.width}
        height={defaultLogo.height}
        priority
        className="h-9 w-auto object-contain sm:h-10"
      />
    </Link>
  );
}
