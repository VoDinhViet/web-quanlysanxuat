import { Badge } from "@/components/ui/badge"
import {
  InventoryDocumentStatus,
  outsourcingReceiptStatusLabels,
} from "@/lib/types/outsourcing-receipt.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// Badge cho raw DB status (POSTED/CANCELLED — DRAFT không còn phát sinh, docs/decisions/
// outsourcing-no-draft.md phía be-quanlysanxuat) — OS-IN không có khái niệm tiến độ riêng như
// OS-OUT (docs/decisions/outsourcing-order-status-progress-merge.md phía be-quanlysanxuat, chỉ áp
// dụng cho outsourcing_orders), status 2 giá trị này là đủ.
export const outsourcingReceiptDocStatusStyles: Record<
  InventoryDocumentStatus,
  BadgeStyle
> = {
  [InventoryDocumentStatus.DRAFT]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  [InventoryDocumentStatus.POSTED]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [InventoryDocumentStatus.CANCELLED]: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
}

type OutsourcingReceiptDocStatusBadgeProps = {
  status: InventoryDocumentStatus
  className?: string
}

export function OutsourcingReceiptDocStatusBadge({
  status,
  className,
}: OutsourcingReceiptDocStatusBadgeProps) {
  const { badge, dot } = outsourcingReceiptDocStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outsourcingReceiptStatusLabels[status]}
    </Badge>
  )
}
