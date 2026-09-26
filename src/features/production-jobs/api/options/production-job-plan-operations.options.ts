import { queryOptions } from "@tanstack/react-query"

import { getProductionJobPlanOperations } from "@/features/production-jobs/api/server-functions/get-production-job-plan-operations.api"

export const productionJobPlanOperationsQueryOptions = (
  productionJobId: string
) =>
  queryOptions({
    queryKey: ["production-jobs", "plan-operations", productionJobId],
    queryFn: () =>
      getProductionJobPlanOperations({ data: { productionJobId } }),
  })
