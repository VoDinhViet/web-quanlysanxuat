import { queryOptions } from "@tanstack/react-query"

import { getProductionJobMaterials } from "@/features/production-jobs/api/server-functions/get-production-job-materials.api"

type ProductionJobMaterialsParams = {
  page?: number
  limit?: number
  q?: string
}

export const productionJobMaterialsQueryOptions = (
  productionJobId: string,
  params: ProductionJobMaterialsParams
) =>
  queryOptions({
    queryKey: ["production-jobs", "materials", productionJobId, params],
    queryFn: () =>
      getProductionJobMaterials({ data: { productionJobId, ...params } }),
  })
