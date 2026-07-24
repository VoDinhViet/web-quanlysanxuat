import { cva } from "class-variance-authority"

import { Badge } from "@/components/ui/badge"
import {
  PRODUCT_STATUS_LABELS,
  ProductStatus,
} from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      [ProductStatus.ACTIVE]: "bg-success/10 text-success",
      [ProductStatus.INACTIVE]: "bg-muted text-muted-foreground",
    },
  },
})

// The dot tints a child element rather than the badge itself, so it stays a
// plain map instead of being folded into the cva above.
const STATUS_DOT_CLASSNAME: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: "bg-success",
  [ProductStatus.INACTIVE]: "bg-muted-foreground/50",
}

type ProductStatusBadgeProps = {
  status: ProductStatus
  className?: string
}

export function ProductStatusBadge({
  status,
  className,
}: ProductStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ status }), className)}
    >
      <span
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASSNAME[status])}
      />
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  )
}
