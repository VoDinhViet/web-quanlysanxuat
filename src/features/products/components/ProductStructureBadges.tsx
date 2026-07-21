import {
  OPERATION_TYPE_LABELS,
  OperationType,
  STRUCTURE_NODE_TYPE_LABELS,
  StructureNodeType,
} from "@/features/products/types/product-structure.type"
import { cn } from "@/lib/utils"

// The product itself (the tree's implicit root, "Cấp 0") isn't a
// StructureNodeType — it's a fourth tone only the level legend and the root
// row need, so it's kept as a sibling union rather than added to the enum.
export type StructureLevelTone = "ROOT" | StructureNodeType

type LevelStyle = {
  dot: string
}

export const STRUCTURE_LEVEL_STYLE: Record<StructureLevelTone, LevelStyle> = {
  ROOT: { dot: "bg-success" },
  [StructureNodeType.ASSEMBLY]: { dot: "bg-blue-500 dark:bg-blue-400" },
  [StructureNodeType.PART]: { dot: "bg-yellow-500 dark:bg-yellow-400" },
  [StructureNodeType.MATERIAL]: { dot: "bg-muted-foreground/50" },
}

export const STRUCTURE_LEVEL_LABELS: Record<StructureLevelTone, string> = {
  ROOT: "Thành phẩm",
  ...STRUCTURE_NODE_TYPE_LABELS,
}

type OperationTypeBadgeStyle = {
  className: string
  dot: string
}

const OPERATION_TYPE_STYLE: Record<OperationType, OperationTypeBadgeStyle> = {
  [OperationType.IN_HOUSE]: {
    className: "bg-success/10 text-success ring-success/20",
    dot: "bg-success",
  },
  [OperationType.OUTSOURCED]: {
    className:
      "bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/20",
    dot: "bg-amber-500",
  },
}

export function OperationTypeBadge({
  type,
  className,
}: {
  type: OperationType
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        OPERATION_TYPE_STYLE[type].className,
        className
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", OPERATION_TYPE_STYLE[type].dot)}
      />
      {OPERATION_TYPE_LABELS[type]}
    </span>
  )
}
