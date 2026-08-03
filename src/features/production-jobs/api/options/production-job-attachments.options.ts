import { queryOptions } from "@tanstack/react-query"

import { getProductionJobAttachments } from "@/features/production-jobs/api/server-functions/get-production-job-attachments.api"

// Read-through from the FG product's own attachments — not paginated, see
// get-production-job-attachments.api.ts.
export const productionJobAttachmentsQueryOptions = (productionJobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "attachments", productionJobId],
    queryFn: () => getProductionJobAttachments({ data: { productionJobId } }),
  })
