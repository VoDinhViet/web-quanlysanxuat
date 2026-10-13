import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

export type TrendDirection = "up" | "down"

export type StatCard = {
  label: string
  value: number
  unit: string
  icon: ComponentType<IconProps>
  iconClassName: string
  trend: {
    direction?: TrendDirection
    text: string
  } | null
}
