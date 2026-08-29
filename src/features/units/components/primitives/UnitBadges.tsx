import { Layers, PackageSearch } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { unitScopeLabels } from "@/lib/types/unit.type"
import type { UnitScope } from "@/lib/types/unit.type"
import { cn } from "@/lib/utils"

type UnitScopeStyle = {
  icon: LucideIcon
  badgeClassName: string
}

// Reuses the exact icons the sidebar already uses for "Vật tư" (Layers) and "Sản phẩm"
// (PackageSearch), so a unit's scope reads through the same visual vocabulary used to
// navigate to those sections — see AppSidebar.tsx.
export const unitScopeStyles: Record<UnitScope, UnitScopeStyle> = {
  MATERIAL: {
    icon: Layers,
    badgeClassName: "bg-info/10 text-info",
  },
  PRODUCT: {
    icon: PackageSearch,
    badgeClassName: "bg-primary/10 text-primary",
  },
}

// The backend's UnitScope also has SEMI_FINISHED (see unit.type.ts) — real API data can carry
// it even though this admin screen doesn't offer it. `scope` below is typed `UnitScope` from
// UnitDetail, but that response is never runtime-validated, so the cast admits an unmapped key
// can come back undefined instead of letting the destructure below crash on it.
const styleByScope = unitScopeStyles as Record<
  string,
  UnitScopeStyle | undefined
>

type UnitScopeBadgeProps = {
  scope: UnitScope
  className?: string
}

export function UnitScopeBadge({ scope, className }: UnitScopeBadgeProps) {
  const style = styleByScope[scope]
  if (!style) return null

  const { icon: Icon, badgeClassName } = style

  return (
    <Badge variant="outline" className={cn(badgeClassName, className)}>
      <Icon />
      {unitScopeLabels[scope]}
    </Badge>
  )
}
