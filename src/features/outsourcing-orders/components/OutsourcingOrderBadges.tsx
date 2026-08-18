import { Badge } from "@/components/ui/badge"
import {
  InventoryDocumentStatus,
  outsourcingOrderDocStatusLabels,
  outsourcingOrderStatusLabels,
} from "@/lib/types/outsourcing-order.type"
import type { OutsourcingOrderStatus } from "@/lib/types/outsourcing-order.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

export const outsourcingOrderStatusStyles: Record<
  OutsourcingOrderStatus,
  BadgeStyle
> = {
  DRAFT: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  SENT: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  PARTIAL: {
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    dot: "bg-sky-500 dark:bg-sky-400",
  },
  WAITING_QC: {
    badge:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    dot: "bg-yellow-500 dark:bg-yellow-400",
  },
  COMPLETED: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  CANCELLED: {
    badge: "border-dashed bg-transparent text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
}

type OutsourcingOrderStatusBadgeProps = {
  status: OutsourcingOrderStatus
  className?: string
}

export function OutsourcingOrderStatusBadge({
  status,
  className,
}: OutsourcingOrderStatusBadgeProps) {
  const { badge, dot } = outsourcingOrderStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outsourcingOrderStatusLabels[status]}
    </Badge>
  )
}

// Badge cho raw DB status (DRAFT/POSTED/CANCELLED) — dùng ở cột Trạng thái của bảng danh sách,
// khác `OutsourcingOrderStatusBadge` (progress, chỉ trang chi tiết còn có dữ liệu để hiển thị).
export const outsourcingOrderDocStatusStyles: Record<
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

type OutsourcingOrderDocStatusBadgeProps = {
  status: InventoryDocumentStatus
  className?: string
}

export function OutsourcingOrderDocStatusBadge({
  status,
  className,
}: OutsourcingOrderDocStatusBadgeProps) {
  const { badge, dot } = outsourcingOrderDocStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outsourcingOrderDocStatusLabels[status]}
    </Badge>
  )
}
