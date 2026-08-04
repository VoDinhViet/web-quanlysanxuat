import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  PurchaseRequestStatus,
} from "@/lib/types/purchase-request.type"
import { cn } from "@/lib/utils"

const purchaseRequestStatusBadgeVariants = cva("", {
  variants: {
    status: {
      [PurchaseRequestStatus.DRAFT]: "bg-muted text-muted-foreground",
      [PurchaseRequestStatus.PENDING_APPROVAL]:
        "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      [PurchaseRequestStatus.APPROVED]:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      [PurchaseRequestStatus.REJECTED]:
        "bg-destructive/10 text-destructive dark:bg-destructive/15",
    },
  },
})

const PURCHASE_REQUEST_STATUS_DOT_CLASSNAME: Record<
  PurchaseRequestStatus,
  string
> = {
  [PurchaseRequestStatus.DRAFT]: "bg-muted-foreground/50",
  [PurchaseRequestStatus.PENDING_APPROVAL]: "bg-amber-500 dark:bg-amber-400",
  [PurchaseRequestStatus.APPROVED]: "bg-emerald-500 dark:bg-emerald-400",
  [PurchaseRequestStatus.REJECTED]: "bg-destructive",
}

type PurchaseRequestStatusBadgeProps = {
  status: PurchaseRequestStatus
  className?: string
}

export function PurchaseRequestStatusBadge({
  status,
  className,
}: PurchaseRequestStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(purchaseRequestStatusBadgeVariants({ status }), className)}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          PURCHASE_REQUEST_STATUS_DOT_CLASSNAME[status]
        )}
      />
      {PURCHASE_REQUEST_STATUS_LABELS[status]}
    </Badge>
  )
}
