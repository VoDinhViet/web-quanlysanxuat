import { Badge } from "@/components/ui/badge"
import type { OutsourcingReceiptProgress } from "@/lib/types/outsourcing-receipt.type"
import { outsourcingReceiptProgressLabels } from "@/lib/types/outsourcing-receipt.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// Mirror 100% OutsourcingOrderBadges.tsx's style map (cùng bảng màu theo progress) — thiếu mỗi
// SENT (OS-IN không có bước "đã gửi chờ NCC xử lý" như OS-OUT).
export const outsourcingReceiptProgressStyles: Record<
  OutsourcingReceiptProgress,
  BadgeStyle
> = {
  DRAFT: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
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

type OutsourcingReceiptStatusBadgeProps = {
  status: OutsourcingReceiptProgress
  className?: string
}

export function OutsourcingReceiptStatusBadge({
  status,
  className,
}: OutsourcingReceiptStatusBadgeProps) {
  const { badge, dot } = outsourcingReceiptProgressStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {outsourcingReceiptProgressLabels[status]}
    </Badge>
  )
}
