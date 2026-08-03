import { queryOptions } from "@tanstack/react-query"

import { getProductionJobBom } from "@/features/production-jobs/api/server-functions/get-production-job-bom.api"

// The Job's BOM tree frozen at LSX approval time ("Công đoạn sản xuất" tab groups by BOM node) —
// not paginated, see get-production-job-bom.api.ts.
export const productionJobBomQueryOptions = (productionJobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "bom", productionJobId],
    queryFn: () => getProductionJobBom({ data: { productionJobId } }),
  })
