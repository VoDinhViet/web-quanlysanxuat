import { queryOptions } from "@tanstack/react-query"

import { getProductionProgress } from "@/features/reports/api/server-functions/get-production-progress.api"

export type ProductionProgressParams = {
  startDate?: string
  endDate?: string
}

export const productionProgressQueryOptions = (
  params: ProductionProgressParams = {}
) =>
  queryOptions({
    queryKey: ["reports", "production-progress", params],
    queryFn: () => getProductionProgress({ data: params }),
  })
