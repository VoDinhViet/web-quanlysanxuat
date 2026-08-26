import { queryOptions } from "@tanstack/react-query"

import { getProductionJobsByOperation } from "@/features/production-execution/api/server-functions/get-production-jobs-by-operation.api"
import type { ProductionExecutionSearchSchema } from "@/features/production-execution/schemas/production-execution-search.schema"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductionJobByOperation } from "@/lib/types/production-job.type"

const emptyPage: PaginatedResponse<ProductionJobByOperation> = {
  data: [],
  pagination: {
    limit: 0,
    currentPage: 1,
    nextPage: null,
    previousPage: null,
    totalRecords: 0,
    totalPages: 0,
  },
}

// "DANH SÁCH CÔNG VIỆC". `search.operationId` is optional at the schema level (the page hasn't
// selected a tile yet on first paint) but required by the server function — the caller also
// passes `enabled: Boolean(search.operationId)` so the network call itself never fires without
// one; this factory just needs to type-check and resolve to something sane in that case too,
// hence the static `emptyPage` fallback instead of narrowing the whole factory signature.
export const productionJobsByOperationQueryOptions = (
  search: ProductionExecutionSearchSchema
) =>
  queryOptions({
    queryKey: ["production-execution", "list", search],
    queryFn: () =>
      search.operationId
        ? getProductionJobsByOperation({
            data: { ...search, operationId: search.operationId },
          })
        : Promise.resolve(emptyPage),
  })
