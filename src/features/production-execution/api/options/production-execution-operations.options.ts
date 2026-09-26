import { queryOptions } from "@tanstack/react-query"

import { getProductionExecutionOperations } from "@/features/production-execution/api/server-functions/get-production-execution-operations.api"
import type { ProductionExecutionFilters } from "@/features/production-execution/schemas/production-execution-search.schema"

// "CHỌN CÔNG ĐOẠN" tile row.
export const productionExecutionOperationsQueryOptions = (
  filters: ProductionExecutionFilters
) =>
  queryOptions({
    queryKey: ["production-execution", "operations", filters],
    queryFn: () => getProductionExecutionOperations({ data: filters }),
  })
