import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { productionJobsQueryOptions } from "@/features/production-jobs/api/options"
import { ProductionJobsPage } from "@/features/production-jobs/pages/ProductionJobsPage"
import { productionJobsSearchSchema } from "@/features/production-jobs/schemas/production-jobs-search.schema"
import { clientOptionsQueryOptions } from "@/features/clients/api"

export const Route = createFileRoute("/(authed)/manage_/production-jobs")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "production:read"),
  validateSearch: productionJobsSearchSchema,
  // No loaderDeps: see materials.tsx for why — a filter/pagination navigation must
  // not create a new route match, which would re-trigger this loader and blank
  // the whole page. The list itself is read client-side in
  // ProductionJobsPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productionJobsQueryOptions(
          productionJobsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: ProductionJobsPage,
  pendingComponent: PageLoading,
})
