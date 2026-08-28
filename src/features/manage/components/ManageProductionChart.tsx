import { useNavigate, useSearch } from "@tanstack/react-router"
import * as RechartsPrimitive from "recharts"

import { ChartContainer } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { DateRangePicker } from "@/components/shared/inputs/DateRangePicker"
import { ManageCardLink } from "@/features/manage/components/ManageCardLink"
import { ManageCardTitle } from "@/features/manage/components/ManageCardTitle"
import { useProductionProgress } from "@/features/manage/hooks/use-production-progress"
import { cn } from "@/lib/utils"

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
  const { slices, total, isPending, isFetching, isError } =
    useProductionProgress()
  const search = useSearch({ from: "/(authed)/manage" })
  const navigate = useNavigate({ from: "/manage" })

  const handleDateChange = (range: {
    from: string | undefined
    to: string | undefined
  }) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        startDate: range.from,
        endDate: range.to,
      }),
    })
  }

  if (isPending) {
    return <Skeleton className="h-64 rounded-lg" />
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ManageCardTitle>Tiến độ sản xuất (tất cả job)</ManageCardTitle>
        <div className="max-w-56">
          <DateRangePicker
            id="manage-production-progress-date-range"
            from={search.startDate}
            to={search.endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>
      <div className={cn(isFetching && "opacity-60 transition-opacity")}>
        {isError ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Không tải được dữ liệu tiến độ sản xuất.
          </p>
        ) : (
          <ManageDonutChart slices={slices} total={total} totalLabel="job" />
        )}
      </div>
      <ManageCardLink />
    </div>
  )
}
