import { stockStatusLabels } from "@/lib/inventory";
import { cn } from "@/lib/cn";
import type { StockStatus } from "@/types/catalog";

const styles: Record<StockStatus, string> = {
  available: "bg-ok-soft text-ok",
  low_stock: "bg-warn-soft text-warn",
  out_of_stock: "bg-off-soft text-off",
};

const dots: Record<StockStatus, string> = {
  available: "bg-ok",
  low_stock: "bg-warn",
  out_of_stock: "bg-off",
};

export function StockBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", dots[status])} />
      {stockStatusLabels[status]}
    </span>
  );
}
