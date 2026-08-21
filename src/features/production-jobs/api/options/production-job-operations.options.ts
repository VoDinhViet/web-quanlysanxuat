import { queryOptions } from "@tanstack/react-query"

import { getProductionJobOperations } from "@/features/production-jobs/api/server-functions/get-production-job-operations.api"

// "Công đoạn sản xuất" tab — every as-used operation of the Job, not paginated (see
// get-production-job-operations.api.ts).
export const productionJobOperationsQueryOptions = (productionJobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "operations", productionJobId],
    queryFn: () => getProductionJobOperations({ data: { productionJobId } }),
  })
