import { queryOptions } from "@tanstack/react-query"

import { getProductionJobNotes } from "@/features/production-jobs/api/server-functions/get-production-job-notes.api"

export const PRODUCTION_JOB_NOTES_PAGE_LIMIT = 10

// The "Ghi chú" sub-section's own pagination — kept as local component state rather than a route
// search param because `page`/`limit` on this route are already owned by the "materials" tab (see
// production-job-detail-search.schema.ts), same idiom as productionOrderLogsQueryOptions.
export const productionJobNotesQueryOptions = (
  productionJobId: string,
  page: number
) =>
  queryOptions({
    queryKey: ["production-jobs", "notes", productionJobId, page],
    queryFn: () =>
      getProductionJobNotes({
        data: { productionJobId, page, limit: PRODUCTION_JOB_NOTES_PAGE_LIMIT },
      }),
  })
