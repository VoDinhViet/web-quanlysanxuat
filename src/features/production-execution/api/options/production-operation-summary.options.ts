import { queryOptions } from "@tanstack/react-query"

import { getProductionOperationSummary } from "@/features/production-execution/api/server-functions/get-production-operation-summary.api"
import type { ProductionExecutionFilters } from "@/features/production-execution/schemas/production-execution-search.schema"

// "CHỌN CÔNG ĐOẠN" tile row.
export const productionOperationSummaryQueryOptions = (
  filters: ProductionExecutionFilters
) =>
  queryOptions({
    queryKey: ["production-execution", "operation-summary", filters],
    queryFn: () => getProductionOperationSummary({ data: filters }),
  })
