import { Badge } from "@/components/ui/badge"
import {
  productLedgerMovementTypeLabels,
  ProductLedgerMovementType,
} from "@/lib/types/product-ledger.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// {badge, dot} local map, same idiom as OqcBadges.tsx/OutboundOrderBadges.tsx — green for nhập
// (tăng tồn), amber for xuất (giảm tồn), neutral for điều chỉnh, a distinct slate for đảo bút toán
// (huỷ phiếu) so it doesn't read as a real ADJUSTMENT document.
const productLedgerMovementTypeStyles: Record<ProductLedgerMovementType, BadgeStyle> = {
  [ProductLedgerMovementType.PRODUCTION_RECEIPT]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [ProductLedgerMovementType.CUSTOMER_RETURN]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [ProductLedgerMovementType.PURCHASE_RECEIPT]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [ProductLedgerMovementType.DELIVERY]: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [ProductLedgerMovementType.OTHER_ISSUE]: {
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  [ProductLedgerMovementType.ADJUSTMENT]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [ProductLedgerMovementType.REVERSAL]: {
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
    dot: "bg-slate-400",
  },
}

type ProductLedgerMovementTypeBadgeProps = {
  type: ProductLedgerMovementType
  className?: string
}

export function ProductLedgerMovementTypeBadge({
  type,
  className,
}: ProductLedgerMovementTypeBadgeProps) {
  const { badge, dot } = productLedgerMovementTypeStyles[type]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {productLedgerMovementTypeLabels[type]}
    </Badge>
  )
}
