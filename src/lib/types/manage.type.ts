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

// Type dưới đây phục vụ widget dashboard duy nhất còn ở mock (chờ BE — xem
// src/features/manage/mock/manage-dashboard.mock.ts). Mọi type mock khác của trang /manage đã
// xoá cùng lúc ghép API thật (xem src/features/manage/hooks/, src/features/reports/api/).

export type NcrByTypeSlice = {
  label: string
  value: number
  colorVar: string
}
