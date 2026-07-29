import billListBold from "@iconify-icons/solar/bill-list-bold"
import checkCircleBold from "@iconify-icons/solar/check-circle-bold"
import dangerTriangleBold from "@iconify-icons/solar/danger-triangle-bold"
import deliveryBold from "@iconify-icons/solar/delivery-bold"
import refreshBold from "@iconify-icons/solar/refresh-bold"
import walletMoneyBold from "@iconify-icons/solar/wallet-money-bold"
import type { IconifyIcon } from "@iconify/types"

import { vndFormatter } from "@/lib/currency"
import type { OrderStats } from "@/lib/types/order.type"

// Plain order counts (not money) — totalOrders/inProgress/expired/completed below all read
// through this, so it stays separate from the shared `vndFormatter` used for the two actual
// money tiles (totalValue/completedValue).
const countFormatter = new Intl.NumberFormat("vi-VN")

// Backend values are already ×100 (e.g. 36.5 means "36.5%") — plain number format + "%",
// not Intl's `style: "percent"` (which expects a 0–1 fraction and would show 3650%).
const percentFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
})

function formatPercentValue(value: number): string {
  return `${percentFormatter.format(value)}%`
}

export type OrderStatTrendDirection = "up" | "down"
export type OrderStatTrendTone = "positive" | "negative" | "neutral"

export type OrderStatTrend = {
  text: string
  direction: OrderStatTrendDirection | null
  tone: OrderStatTrendTone
}

type TrendResult = {
  text: string
  direction: OrderStatTrendDirection | null
}

// diff = 0 → "Không đổi"; khác 0 → dấu (lên/xuống) + độ lớn đã format. `diff: null` (chỉ
// xảy ra ở 2 field *TrendPercent — không có kỳ trước để so sánh) → ẩn hẳn dòng trend.
function formatSignedTrend(
  diff: number | null,
  period: string,
  formatMagnitude: (absValue: number) => string
): TrendResult | null {
  if (diff === null) {
    return null
  }

  if (diff === 0) {
    return { text: `Không đổi so với ${period}`, direction: null }
  }

  return {
    text: `${formatMagnitude(Math.abs(diff))} so với ${period}`,
    direction: diff > 0 ? "up" : "down",
  }
}

// Plain share-of-total, pre-computed by the backend — no better/worse direction.
function formatShareOfTotal(percent: number, suffix: string): TrendResult {
  return { text: `${formatPercentValue(percent)} ${suffix}`, direction: null }
}

export type OrderStatTile = {
  label: string
  value: string
  unit: string
  trend: OrderStatTrend | null
  icon: IconifyIcon
  iconClassName: string
  valueSizeClassName: string
}

type OrderStatTileDef = {
  label: string
  icon: IconifyIcon
  iconClassName: string
  valueSizeClassName: string
  unit: string
  // Which trend direction counts as good news for this tile — `null` when the
  // trend is a plain share-of-total ratio with no "better" direction.
  positiveDirection: OrderStatTrendDirection | null
  selectValue: (stats: OrderStats) => string
  selectTrend: (stats: OrderStats) => TrendResult | null
}

function resolveTone(
  direction: OrderStatTrendDirection | null,
  positiveDirection: OrderStatTrendDirection | null
): OrderStatTrendTone {
  if (direction === null || positiveDirection === null) {
    return "neutral"
  }

  return direction === positiveDirection ? "positive" : "negative"
}

const ORDER_STAT_TILE_DEFS: OrderStatTileDef[] = [
  {
    label: "Tổng đơn hàng",
    icon: billListBold,
    iconClassName: "bg-info/15 text-info",
    valueSizeClassName: "text-2xl",
    unit: "đơn",
    positiveDirection: "up",
    selectValue: (stats) => countFormatter.format(stats.totalOrders),
    selectTrend: (stats) =>
      formatSignedTrend(
        stats.totalOrdersTrendPercent,
        "tháng trước",
        formatPercentValue
      ),
  },
  {
    label: "Tổng giá trị",
    icon: walletMoneyBold,
    iconClassName: "bg-success/15 text-success",
    valueSizeClassName: "text-lg",
    unit: "VND",
    positiveDirection: "up",
    selectValue: (stats) => vndFormatter.format(stats.totalValue),
    selectTrend: (stats) =>
      formatSignedTrend(
        stats.totalValueTrendPercent,
        "tháng trước",
        formatPercentValue
      ),
  },
  {
    label: "Đã giao",
    icon: deliveryBold,
    iconClassName:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
    valueSizeClassName: "text-lg",
    unit: "VND",
    positiveDirection: null,
    selectValue: (stats) => vndFormatter.format(stats.completedValue),
    selectTrend: (stats) =>
      formatShareOfTotal(
        stats.completedValuePercentOfTotal,
        "so với tổng giá trị"
      ),
  },
  {
    label: "Đang thực hiện",
    icon: refreshBold,
    iconClassName: "bg-warning/15 text-warning",
    valueSizeClassName: "text-2xl",
    unit: "đơn",
    positiveDirection: null,
    selectValue: (stats) => countFormatter.format(stats.inProgress),
    selectTrend: (stats) =>
      formatShareOfTotal(stats.inProgressPercentOfTotal, "so với tổng số đơn"),
  },
  {
    label: "Trễ hạn",
    icon: dangerTriangleBold,
    iconClassName: "bg-destructive/15 text-destructive",
    valueSizeClassName: "text-2xl",
    unit: "đơn",
    // A drop in overdue orders is good news — tone follows meaning, not the
    // raw arrow direction.
    positiveDirection: "down",
    selectValue: (stats) => countFormatter.format(stats.expired),
    selectTrend: (stats) =>
      formatSignedTrend(stats.expiredTrendCount, "tuần trước", String),
  },
  {
    label: "Hoàn thành",
    icon: checkCircleBold,
    iconClassName: "bg-success/15 text-success",
    valueSizeClassName: "text-2xl",
    unit: "đơn",
    positiveDirection: null,
    selectValue: (stats) => countFormatter.format(stats.completed),
    selectTrend: (stats) =>
      formatShareOfTotal(stats.completedPercentOfTotal, "so với tổng số đơn"),
  },
]

export function buildOrderStatTiles(stats: OrderStats): OrderStatTile[] {
  return ORDER_STAT_TILE_DEFS.map((def) => {
    const trend = def.selectTrend(stats)

    return {
      label: def.label,
      value: def.selectValue(stats),
      unit: def.unit,
      trend: trend && {
        ...trend,
        tone: resolveTone(trend.direction, def.positiveDirection),
      },
      icon: def.icon,
      iconClassName: def.iconClassName,
      valueSizeClassName: def.valueSizeClassName,
    }
  })
}
