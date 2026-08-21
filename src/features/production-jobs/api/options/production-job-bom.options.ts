import { queryOptions } from "@tanstack/react-query"

import { getProductionJobBom } from "@/features/production-jobs/api/server-functions/get-production-job-bom.api"

type ProductionJobBomParams = {
  page?: number
  limit?: number
  q?: string
}

// Tab "BOM" — the Job's material demand, paginated (see get-production-job-bom.api.ts for
// why this reads GET .../bom despite the tab not being about the BOM tree).
export const productionJobBomQueryOptions = (
  productionJobId: string,
  params: ProductionJobBomParams
) =>
  queryOptions({
    queryKey: ["production-jobs", "bom", productionJobId, params],
    queryFn: () =>
      getProductionJobBom({ data: { productionJobId, ...params } }),
  })
