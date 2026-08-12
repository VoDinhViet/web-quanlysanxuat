import {
  CheckCircle,
  ClipboardCheck,
  ClipboardText,
  ClockCircle,
  CloseCircle,
  UndoLeftRound,
} from "@solar-icons/react"
import type { IconProps } from "@solar-icons/react"
import type { ComponentType } from "react"

import type { IqcStats } from "@/lib/types/iqc.type"

// IqcStatsResDto only sends raw counts (unlike OrderStats, which has backend-computed trend/
// percent fields) — each tile's share of `total` is derived here, same formatPercent idiom as
// SupplierStatCards.tsx.
const percentFormatter = new Intl.NumberFormat("vi-VN", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatPercent(count: number, total: number): string {
  if (total === 0) return "0%"

  return percentFormatter.format(count / total)
}

export type IqcStatTile = {
  label: string
  value: number
  // null → thẻ tổng, không có phần trăm để so với chính nó.
  percent: string | null
  icon: ComponentType<IconProps>
  iconClassName: string
}

type IqcStatTileDef = {
  label: string
  icon: ComponentType<IconProps>
  iconClassName: string
  selectValue: (stats: IqcStats) => number
  // null → this tile is the grand total, shown without a share-of-total percentage.
  selectPercentBase: ((stats: IqcStats) => number) | null
}

const iqcStatTileDefs: IqcStatTileDef[] = [
  {
    label: "Tổng IQC",
    icon: ClipboardText,
    iconClassName: "bg-info/15 text-info",
    selectValue: (stats) => stats.total,
    selectPercentBase: null,
  },
  {
    label: "PASS",
    icon: CheckCircle,
    iconClassName: "bg-success/15 text-success",
    selectValue: (stats) => stats.pass,
    selectPercentBase: (stats) => stats.total,
  },
  {
    label: "FAIL",
    icon: CloseCircle,
    iconClassName: "bg-destructive/15 text-destructive",
    selectValue: (stats) => stats.fail,
    selectPercentBase: (stats) => stats.total,
  },
  {
    label: "Chờ xử lý",
    icon: ClockCircle,
    iconClassName:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    selectValue: (stats) => stats.pending,
    selectPercentBase: (stats) => stats.total,
  },
  {
    label: "Chờ trả NCC",
    icon: UndoLeftRound,
    iconClassName:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    selectValue: (stats) => stats.waitingReturn,
    selectPercentBase: (stats) => stats.total,
  },
  {
    label: "Hoàn thành",
    icon: ClipboardCheck,
    iconClassName: "bg-success/15 text-success",
    selectValue: (stats) => stats.completed,
    selectPercentBase: (stats) => stats.total,
  },
]

export function buildIqcStatTiles(stats: IqcStats): IqcStatTile[] {
  return iqcStatTileDefs.map((def) => {
    const value = def.selectValue(stats)

    return {
      label: def.label,
      value,
      percent:
        def.selectPercentBase &&
        formatPercent(value, def.selectPercentBase(stats)),
      icon: def.icon,
      iconClassName: def.iconClassName,
    }
  })
}
