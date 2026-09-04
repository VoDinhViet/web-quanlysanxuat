import { queryOptions } from "@tanstack/react-query"

import { getProductionJobLogs } from "@/features/production-jobs/api/server-functions/get-production-job-logs.api"

// The "Lịch sử thay đổi" sub-section's own pagination — kept as local component state rather than
// a route search param because `page`/`limit` on this route are already owned by the "materials"
// tab (see production-job-detail-search.schema.ts), same idiom as productionOrderLogsQueryOptions/
// productionJobNotesQueryOptions. `limit` caller-supplied (not a fixed constant) so
// ProductionJobLogSection.tsx can drive it via Pagination, same idiom as
// requisitionLinesQueryOptions/CreateInventoryRequisitionPickerSection.tsx.
export const productionJobLogsQueryOptions = (
  productionJobId: string,
  page: number,
  limit: number
) =>
  queryOptions({
    queryKey: ["production-jobs", "logs", productionJobId, page, limit],
    queryFn: () =>
      getProductionJobLogs({ data: { productionJobId, page, limit } }),
  })
