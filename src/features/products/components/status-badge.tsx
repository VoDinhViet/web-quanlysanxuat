import { Badge } from "@/components/ui/badge"
import { PRODUCT_STATUS_LABELS } from "@/features/products/types/product.type"
import { cn } from "@/lib/utils"
import type { ProductStatus } from "@/features/products/types/product.type"

export function StatusBadge({ status }: { status: ProductStatus }) {
  const isActive = status === "ACTIVE"

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 border-transparent px-2 text-[10px] font-medium",
        isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
      )}
    >
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  )
}
