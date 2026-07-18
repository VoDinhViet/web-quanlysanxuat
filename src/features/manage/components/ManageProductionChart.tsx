import * as RechartsPrimitive from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import {
  PRODUCTION_PROGRESS,
  PRODUCTION_PROGRESS_TOTAL,
} from "@/features/manage/mock/manage-dashboard.mock"

type DonutSlice = {
  label: string
  value: number
  colorVar: string
}

type ManageDonutChartProps = {
  slices: DonutSlice[]
  total: number
  totalLabel: string
}

/** Shared donut-with-legend rendering — used by both the production-progress
 *  and NCR-by-type charts, which are visually identical aside from data. */
export function ManageDonutChart({
  slices,
  total,
  totalLabel,
}: ManageDonutChartProps) {
  const config: ChartConfig = Object.fromEntries(
    slices.map((slice) => [
      slice.label,
      { label: slice.label, color: slice.colorVar },
    ])
  )

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative mx-auto aspect-square w-40 shrink-0">
        <ChartContainer config={config} className="size-full">
          <RechartsPrimitive.PieChart>
            <RechartsPrimitive.Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="65%"
              outerRadius="100%"
              strokeWidth={2}
            >
              {slices.map((slice) => (
                <RechartsPrimitive.Cell
                  key={slice.label}
                  fill={slice.colorVar}
                />
              ))}
            </RechartsPrimitive.Pie>
          </RechartsPrimitive.PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Tổng số
          </span>
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-[11px] text-muted-foreground">
            {totalLabel}
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2 text-xs">
        {slices.map((slice) => {
          const percent =
            total > 0 ? Math.round((slice.value / total) * 100) : 0

          return (
            <li
              key={slice.label}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-foreground">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.colorVar }}
                />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 tabular-nums">
                <span className="w-6 text-right font-semibold text-foreground">
                  {slice.value}
                </span>
                <span className="w-10 text-right text-muted-foreground">
                  ({percent}%)
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ManageProductionChart() {
  return (
    <ManageDonutChart
      slices={PRODUCTION_PROGRESS}
      total={PRODUCTION_PROGRESS_TOTAL}
      totalLabel="job"
    />
  )
}
