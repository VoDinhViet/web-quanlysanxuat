import { Badge } from "@/components/ui/badge"
import type { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import { paymentRequestStatusLabels } from "@/lib/types/payment-request.type"
import { cn } from "@/lib/utils"

type BadgeStyle = {
  badge: string
  dot: string
}

// Same palette idiom as PurchaseOrderBadges.tsx.
export const paymentRequestStatusStyles: Record<
  PaymentRequestStatus,
  BadgeStyle
> = {
  PENDING: {
    badge:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  PAID: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  CANCELLED: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
}

type PaymentRequestStatusBadgeProps = {
  status: PaymentRequestStatus
  className?: string
}

export function PaymentRequestStatusBadge({
  status,
  className,
}: PaymentRequestStatusBadgeProps) {
  const { badge, dot } = paymentRequestStatusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {paymentRequestStatusLabels[status]}
    </Badge>
  )
}
