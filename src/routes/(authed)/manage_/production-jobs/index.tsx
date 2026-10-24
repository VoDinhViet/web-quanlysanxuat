import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import {
  productionJobStatsQueryOptions,
  productionJobsQueryOptions,
} from "@/features/production-jobs/api/options"
import { ProductionJobsPage } from "@/features/production-jobs/pages/ProductionJobsPage"
import { productionJobStatsSearchSchema } from "@/features/production-jobs/schemas/production-job-stats-search.schema"
import { productionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"
import { clientsQueryOptions } from "@/features/clients/api"

export const Route = createFileRoute("/(authed)/manage_/production-jobs/")({
  validateSearch: productionJobsSearchSchema,
  // No loaderDeps: see directs.tsx for why — a filter/pagination navigation must
  // not create a new route match, which would re-trigger this loader and blank
  // the outlet. The list itself is read client-side in
  // ProductionJobsPage via useQuery instead.
  loader: ({ context, location }) => {
    const search = productionJobsSearchSchema.parse(location.search)
    // Not awaited: the stat tiles are secondary and render their own skeleton.
    void context.queryClient
      .query(
        productionJobStatsQueryOptions(
          productionJobStatsSearchSchema.parse(search)
        )
      )
      .catch(noop)

    return Promise.all([
      context.queryClient.query({
        ...productionJobsQueryOptions(search),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...clientsQueryOptions({ page: 1, limit: 20 }),
        staleTime: "static",
      }),
    ])
  },
  component: ProductionJobsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
