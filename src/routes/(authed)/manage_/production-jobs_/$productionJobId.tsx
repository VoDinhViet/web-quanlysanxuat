import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { productionJobQueryOptions } from "@/features/production-jobs/api/production-jobs.options"
import { ProductionJobDetailPage } from "@/features/production-jobs/pages/ProductionJobDetailPage"
import { productionJobDetailSearchSchema } from "@/features/production-jobs/schemas/production-job-detail-search.schema"

// Steps/materials (bom + operations tabs) are read client-side by their own tab component — not
// critical to the first paint of the default "info" tab, so they aren't prefetched here.
export const Route = createFileRoute(
  "/(authed)/manage_/production-jobs_/$productionJobId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "production:read"),
  validateSearch: productionJobDetailSearchSchema,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      productionJobQueryOptions(params.productionJobId)
    ),
  component: ProductionJobDetailPage,
  pendingComponent: PageLoading,
})
