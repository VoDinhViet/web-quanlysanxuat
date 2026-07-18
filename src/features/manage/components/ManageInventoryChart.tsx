import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { INVENTORY_ALERTS } from "@/features/manage/mock/manage-dashboard.mock"

const chartConfig: ChartConfig = {
  belowMinimum: {
    label: "Thấp hơn mức tối thiểu",
    color: "var(--color-chart-5)",
  },
  runningLow: { label: "Sắp hết", color: "var(--color-chart-4)" },
}

export function ManageInventoryChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <RechartsPrimitive.BarChart data={INVENTORY_ALERTS}>
        <RechartsPrimitive.CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
        />
        <RechartsPrimitive.XAxis
          dataKey="materialCode"
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <RechartsPrimitive.YAxis
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <RechartsPrimitive.Bar
          dataKey="belowMinimum"
          name="Thấp hơn mức tối thiểu"
          fill="var(--color-belowMinimum)"
          radius={4}
        />
        <RechartsPrimitive.Bar
          dataKey="runningLow"
          name="Sắp hết"
          fill="var(--color-runningLow)"
          radius={4}
        />
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  )
}
