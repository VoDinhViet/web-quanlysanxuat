import {
  STRUCTURE_LEVEL_LABELS,
  STRUCTURE_LEVEL_STYLE,
} from "@/features/products/components/ProductStructureBadges"
import { StructureNodeType } from "@/features/products/types/product-structure.type"
import type { StructureLevelTone } from "@/features/products/components/ProductStructureBadges"
import { cn } from "@/lib/utils"

// Display order is the BOM's actual depth order (0 = product, 1 = assembly,
// 2 = part, 3 = purchased material) — the same order the "Cấp" column and
// row indentation follow.
const LEGEND_TONES: StructureLevelTone[] = [
  "ROOT",
  StructureNodeType.ASSEMBLY,
  StructureNodeType.PART,
  StructureNodeType.MATERIAL,
]

export function ProductStructureLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
      <span className="font-semibold text-foreground">Ghi chú cấp:</span>
      {LEGEND_TONES.map((tone, level) => (
        <span
          key={tone}
          className="flex items-center gap-1.5 text-muted-foreground"
        >
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              STRUCTURE_LEVEL_STYLE[tone].dot
            )}
          />
          {level} - {STRUCTURE_LEVEL_LABELS[tone]}
        </span>
      ))}
    </div>
  )
}
