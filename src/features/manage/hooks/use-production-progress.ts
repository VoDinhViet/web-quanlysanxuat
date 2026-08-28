import { useSearch } from "@tanstack/react-router"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { productionProgressQueryOptions } from "@/features/reports/api"
import { productionJobStatusLabels } from "@/lib/types/production-job.type"

const donutColorVars = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

// Donut "Tiến độ sản xuất" — BE trả sẵn breakdown theo đúng thứ tự ProductionJobStatus (luôn đủ 5
// phần tử, kể cả count = 0), thay cho cách cũ gộp 5 request song song (1/status, đọc
// pagination.totalRecords mỗi cái). startDate/endDate đọc từ search param của chính route
// /manage (ManageProductionChart tự bind DateRangePicker vào cùng search này) — loader
// (routes/(authed)/manage.tsx) prefetch đúng query key này qua parse location.search, nên không
// lệch nhau. `placeholderData: keepPreviousData` để đổi khoảng ngày không làm donut nháy về
// skeleton — giữ số cũ, chỉ mờ đi trong lúc chờ (xem ManageProductionChart).
export function useProductionProgress() {
  const { startDate, endDate } = useSearch({ from: "/(authed)/manage" })
  const query = useQuery({
    ...productionProgressQueryOptions({ startDate, endDate }),
    placeholderData: keepPreviousData,
  })

  const slices = (query.data?.breakdown ?? []).map((item, index) => ({
    label: productionJobStatusLabels[item.status],
    value: item.count,
    colorVar: donutColorVars[index % donutColorVars.length],
  }))

  return {
    slices,
    total: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
  }
}
