import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { productionJobQueryOptions } from "@/features/production-jobs/api/options"
import { ProductionJobDetailPage } from "@/features/production-jobs/pages/ProductionJobDetailPage"
import { productionJobDetailSearchSchema } from "@/features/production-jobs/schemas/production-job-detail-search.schema"
import { itemQueryOptions } from "@/features/products/api"

// BOM vật tư (bom tab) is read client-side by its own tab component — not critical to the
// first paint of the default "info" tab, so it isn't prefetched here.
export const Route = createFileRoute(
  "/(authed)/manage_/production-jobs_/$productionJobId"
)({
  validateSearch: productionJobDetailSearchSchema,
  loader: async ({ context, params }) => {
    const job = await context.queryClient.query({
      ...productionJobQueryOptions(params.productionJobId),
      staleTime: "static",
    })

    await context.queryClient.query({
      ...itemQueryOptions(job.itemId),
      staleTime: "static",
    })
  },
  component: ProductionJobDetailPage,
  pendingComponent: LayoutPagePending,
})
