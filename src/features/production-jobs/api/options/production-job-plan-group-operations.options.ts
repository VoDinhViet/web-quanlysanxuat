import { queryOptions } from "@tanstack/react-query"

import { getProductionJobPlanGroupOperations } from "@/features/production-jobs/api/server-functions/get-production-job-plan-group-operations.api"

export const productionJobPlanGroupOperationsQueryOptions = (
  productionJobId: string
) =>
  queryOptions({
    queryKey: ["production-jobs", "plan-group-operations", productionJobId],
    queryFn: () =>
      getProductionJobPlanGroupOperations({ data: { productionJobId } }),
  })
