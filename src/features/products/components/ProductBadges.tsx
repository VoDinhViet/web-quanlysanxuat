import {
  PRODUCT_STATUS_LABELS,
  ProductStatus,
} from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  className: string
  dot: string
}

const STATUS_STYLE: Record<ProductStatus, StatusBadgeStyle> = {
  [ProductStatus.ACTIVE]: {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    dot: "bg-emerald-500",
  },
  [ProductStatus.INACTIVE]: {
    className: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/50",
  },
}

export function ProductStatusBadge({
  status,
  className,
}: {
  status: ProductStatus
  className?: string
}) {
  const { className: styleClassName, dot } = STATUS_STYLE[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        styleClassName,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {PRODUCT_STATUS_LABELS[status]}
    </span>
  )
}
