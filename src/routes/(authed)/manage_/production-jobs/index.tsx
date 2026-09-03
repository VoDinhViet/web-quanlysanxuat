import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"
import { ProductionJobsPage } from "@/features/production-jobs/pages/ProductionJobsPage"
import { productionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"
import { clientOptionsQueryOptions } from "@/features/clients/api"

export const Route = createFileRoute("/(authed)/manage_/production-jobs/")({
  validateSearch: productionJobsSearchSchema,
  // No loaderDeps: see materials.tsx for why — a filter/pagination navigation must
  // not create a new route match, which would re-trigger this loader and blank
  // the outlet. The list itself is read client-side in
  // ProductionJobsPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.query({
        ...productionJobsQueryOptions(
          productionJobsSearchSchema.parse(location.search)
        ),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...clientOptionsQueryOptions(""),
        staleTime: "static",
      }),
    ]),
  component: ProductionJobsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
