import { useQuery } from "@tanstack/react-query"
import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { qcPassRateQueryOptions } from "@/features/reports/api"
import { DateTime } from "luxon"

const iqcColor = "var(--color-chart-1)"
const oqcColor = "var(--color-chart-2)"

const chartConfig: ChartConfig = {
  iqcPassRate: { label: "IQC đạt (%)", color: iqcColor },
  oqcPassRate: { label: "OQC đạt (%)", color: oqcColor },
}

const qcRateSeries = [
  { key: "iqcPassRate", label: "IQC đạt (%)", color: iqcColor },
  { key: "oqcPassRate", label: "OQC đạt (%)", color: oqcColor },
]

function formatDay(value: string): string {
  return DateTime.fromISO(value).toFormat("dd/MM")
}

export function ManageQcRateChart() {
  const query = useQuery(qcPassRateQueryOptions())

  if (query.isPending) {
    return <Skeleton className="h-64 w-full" />
  }

  if (query.isError) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        Không tải được dữ liệu tỷ lệ đạt QC.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap items-center gap-4 text-xs">
        {qcRateSeries.map((series) => (
          <li
            key={series.key}
            className="flex items-center gap-2 text-foreground"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: series.color }}
            />
            {series.label}
          </li>
        ))}
      </ul>
      <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
        <RechartsPrimitive.LineChart
          data={query.data}
          margin={{ left: -8, right: 8, top: 4 }}
        >
          <RechartsPrimitive.CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
          />
          <RechartsPrimitive.XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tickFormatter={formatDay}
          />
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  typeof value === "string" ? formatDay(value) : value
                }
              />
            }
          />
          <RechartsPrimitive.Line
            type="monotone"
            dataKey="iqcPassRate"
            name="IQC đạt (%)"
            stroke="var(--color-iqcPassRate)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 4 }}
          />
          <RechartsPrimitive.Line
            type="monotone"
            dataKey="oqcPassRate"
            name="OQC đạt (%)"
            stroke="var(--color-oqcPassRate)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 4 }}
          />
        </RechartsPrimitive.LineChart>
      </ChartContainer>
    </div>
  )
}
