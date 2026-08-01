import { queryOptions } from "@tanstack/react-query"

import { getProductionJobMaterials } from "@/features/production-jobs/api/server-functions/get-production-job-materials.api"
import { getProductionJobSteps } from "@/features/production-jobs/api/server-functions/get-production-job-steps.api"
import { getProductionJob } from "@/features/production-jobs/api/server-functions/get-production-job.api"
import { getProductionJobs } from "@/features/production-jobs/api/server-functions/get-production-jobs.api"
import type { ProductionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"

// Query key convention (see .claude/rules/architecture.md): `["production-jobs"]` is the feature
// root, so `invalidateQueries({ queryKey: ["production-jobs"] })` refreshes the whole feature.
export const productionJobsQueryOptions = (
  search: ProductionJobsSearchSchema
) =>
  queryOptions({
    queryKey: ["production-jobs", "list", search],
    queryFn: () => getProductionJobs({ data: search }),
  })

export const productionJobQueryOptions = (jobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "detail", jobId],
    queryFn: () => getProductionJob({ data: { jobId } }),
  })

// The Job's routing snapshot ("Công đoạn sản xuất" tab) — not paginated, see
// get-production-job-steps.api.ts.
export const productionJobStepsQueryOptions = (productionJobId: string) =>
  queryOptions({
    queryKey: ["production-jobs", "steps", productionJobId],
    queryFn: () => getProductionJobSteps({ data: { productionJobId } }),
  })

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
