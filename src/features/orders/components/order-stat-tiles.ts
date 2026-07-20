import {
  AlertTriangle,
  CircleCheck,
  ClipboardList,
  Coins,
  Loader,
  Truck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { OrderStats } from "@/features/orders/types/order.type"

const currencyFormatter = new Intl.NumberFormat("vi-VN")

const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatRatio(
  part: number,
  whole: number,
  suffix: string
): string | null {
  if (whole === 0) {
    return null
  }

  return `${percentFormatter.format(part / whole)} ${suffix}`
}

// Period-over-period deltas need history the FE has no access to, so they render
// only when the backend supplied the comparison figure. A null subtitle renders
// nothing — never a placeholder, never an invented number.
function formatCountDelta(
  current: number,
  previous: number | null,
  period: string
): string | null {
  if (previous === null) {
    return null
  }

  const diff = current - previous

  if (diff === 0) {
    return `Không đổi so với ${period}`
  }

  return `${diff > 0 ? "↑" : "↓"}${Math.abs(diff)} so với ${period}`
}

function formatValueDelta(
  current: number,
  previous: number | null,
  period: string
): string | null {
  if (previous === null || previous === 0) {
    return null
  }

  const ratio = (current - previous) / previous

  return `${ratio > 0 ? "+" : ""}${percentFormatter.format(ratio)} so với ${period}`
}

export type OrderStatTile = {
  label: string
  value: string
  subtitle: string | null
  icon: LucideIcon
  iconClassName: string
  accentClassName: string
}

type OrderStatTileDef = {
  label: string
  icon: LucideIcon
  iconClassName: string
  accentClassName: string
  selectValue: (stats: OrderStats) => string
  selectSubtitle: (stats: OrderStats) => string | null
}

const ORDER_STAT_TILE_DEFS: OrderStatTileDef[] = [
  {
    label: "Tổng đơn hàng",
    icon: ClipboardList,
    iconClassName: "bg-blue-100 text-blue-700",
    accentClassName: "before:bg-blue-500",
    selectValue: (stats) => `${currencyFormatter.format(stats.totalCount)} đơn`,
    selectSubtitle: (stats) =>
      formatCountDelta(
        stats.totalCount,
        stats.previousMonth?.totalCount ?? null,
        "tháng trước"
      ),
  },
  {
    label: "Tổng giá trị",
    icon: Coins,
    iconClassName: "bg-indigo-100 text-indigo-700",
    accentClassName: "before:bg-indigo-500",
    selectValue: (stats) => `${currencyFormatter.format(stats.totalValue)} VND`,
    selectSubtitle: (stats) =>
      formatValueDelta(
        stats.totalValue,
        stats.previousMonth?.totalValue ?? null,
        "tháng trước"
      ),
  },
  {
    label: "Đã giao",
    icon: Truck,
    iconClassName: "bg-sky-100 text-sky-700",
    accentClassName: "before:bg-sky-500",
    selectValue: (stats) =>
      `${currencyFormatter.format(stats.deliveredValue)} VND`,
    selectSubtitle: (stats) =>
      formatRatio(
        stats.deliveredValue,
        stats.totalValue,
        "so với tổng giá trị"
      ),
  },
  {
    label: "Đang thực hiện",
    icon: Loader,
    iconClassName: "bg-amber-100 text-amber-700",
    accentClassName: "before:bg-amber-500",
    selectValue: (stats) =>
      `${currencyFormatter.format(stats.inProgressCount)} đơn`,
    selectSubtitle: (stats) =>
      formatRatio(
        stats.inProgressCount,
        stats.totalCount,
        "so với tổng số đơn"
      ),
  },
  {
    label: "Trễ hạn",
    icon: AlertTriangle,
    iconClassName: "bg-red-100 text-red-700",
    accentClassName: "before:bg-red-500",
    selectValue: (stats) =>
      `${currencyFormatter.format(stats.overdueCount)} đơn`,
    selectSubtitle: (stats) =>
      formatCountDelta(
        stats.overdueCount,
        stats.previousWeekOverdueCount,
        "tuần trước"
      ),
  },
  {
    label: "Hoàn thành",
    icon: CircleCheck,
    iconClassName: "bg-emerald-100 text-emerald-700",
    accentClassName: "before:bg-emerald-500",
    selectValue: (stats) =>
      `${currencyFormatter.format(stats.completedCount)} đơn`,
    selectSubtitle: (stats) =>
      formatRatio(stats.completedCount, stats.totalCount, "so với tổng số đơn"),
  },
]

export function buildOrderStatTiles(stats: OrderStats): OrderStatTile[] {
  return ORDER_STAT_TILE_DEFS.map((def) => ({
    label: def.label,
    value: def.selectValue(stats),
    subtitle: def.selectSubtitle(stats),
    icon: def.icon,
    iconClassName: def.iconClassName,
    accentClassName: def.accentClassName,
  }))
}
