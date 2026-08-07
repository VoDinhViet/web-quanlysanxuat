import { Badge } from "@/components/ui/badge"
import { BOM_NODE_ITEM_TYPE_LABELS } from "@/lib/types/bom-item.type"
import type { BomNodeItemType } from "@/lib/types/bom-item.type"
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  ProductStatus,
  ProductType,
} from "@/lib/types/product.type"
import { cn } from "@/lib/utils"

type StatusBadgeStyle = {
  badge: string
  dot: string
}

const statusStyles: Record<ProductStatus, StatusBadgeStyle> = {
  [ProductStatus.ACTIVE]: {
    badge: "bg-success/10 text-success",
    dot: "bg-success",
  },
  [ProductStatus.INACTIVE]: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
}

type ProductStatusBadgeProps = {
  status: ProductStatus
  className?: string
}

export function ProductStatusBadge({
  status,
  className,
}: ProductStatusBadgeProps) {
  const { badge, dot } = statusStyles[status]

  return (
    <Badge variant="outline" className={cn(badge, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} />
      {PRODUCT_STATUS_LABELS[status]}
    </Badge>
  )
}

const typeStyles: Record<ProductType, string> = {
  [ProductType.FG]: "bg-primary/10 text-primary",
  [ProductType.WIP]: "bg-warning/10 text-warning",
}

type ProductTypeBadgeProps = {
  type: ProductType
  className?: string
}

export function ProductTypeBadge({ type, className }: ProductTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn(typeStyles[type], className)}>
      {PRODUCT_TYPE_LABELS[type]}
    </Badge>
  )
}

const bomNodeTypeStyles: Record<BomNodeItemType, string> = {
  WIP: "bg-warning/10 text-warning",
  RM: "bg-info/10 text-info",
}

type BomNodeTypeBadgeProps = {
  type: BomNodeItemType
  className?: string
}

// Distinguishes a WIP sub-assembly node from an RM material leaf in the BOM
// tree — both node types render in the same table now that RM leaves live
// directly in bom_items (see docs/decisions/items-merge.md on the backend).
export function BomNodeTypeBadge({ type, className }: BomNodeTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn(bomNodeTypeStyles[type], className)}>
      {BOM_NODE_ITEM_TYPE_LABELS[type]}
    </Badge>
  )
}
