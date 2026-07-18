import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { QC_RATE_POINTS } from "@/features/manage/mock/manage-dashboard.mock"

const IQC_COLOR = "#3b82f6"
const OQC_COLOR = "#22c55e"

const chartConfig: ChartConfig = {
  iqcPassRate: { label: "IQC đạt (%)", color: IQC_COLOR },
  oqcPassRate: { label: "OQC đạt (%)", color: OQC_COLOR },
}

const SERIES = [
  { key: "iqcPassRate", label: "IQC đạt (%)", color: IQC_COLOR },
  { key: "oqcPassRate", label: "OQC đạt (%)", color: OQC_COLOR },
]

export function ManageQcRateChart() {
  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap items-center gap-4 text-xs">
        {SERIES.map((series) => (
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
          data={QC_RATE_POINTS}
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
          />
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
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
