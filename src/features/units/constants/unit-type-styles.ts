import { Cup, Ruler, Scale, Stop } from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import { UnitType } from "@/lib/types/unit.type"

type UnitTypeStyle = {
  icon: ComponentType<IconProps>
  tile: string
  dot: string
}

// Icon + color of each unit type — shared by the table (code tile, type dot) and the form's
// type select so the same type always looks the same.
export const unitTypeStyles: Record<UnitType, UnitTypeStyle> = {
  [UnitType.QUANTITY]: {
    icon: Stop,
    tile: "bg-info/15 text-info",
    dot: "bg-info",
  },
  [UnitType.WEIGHT]: {
    icon: Scale,
    tile: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  [UnitType.LENGTH]: {
    icon: Ruler,
    tile: "bg-success/15 text-success",
    dot: "bg-success",
  },
  [UnitType.VOLUME]: {
    icon: Cup,
    tile: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
}
