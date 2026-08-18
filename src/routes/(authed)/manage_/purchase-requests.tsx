import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { departmentOptionsQueryOptions } from "@/features/departments/api"
import { purchaseRequestsQueryOptions } from "@/features/purchase-requests/api/options"
import { PurchaseRequestsPage } from "@/features/purchase-requests/pages/PurchaseRequestsPage"
import { purchaseRequestsSearchSchema } from "@/features/purchase-requests/schemas/purchase-requests-search.schema"

export const Route = createFileRoute("/(authed)/manage_/purchase-requests")({
  validateSearch: purchaseRequestsSearchSchema,
  // No loaderDeps: see production-jobs.tsx for why — a filter/pagination navigation
  // must not create a new route match, which would re-trigger this loader and blank
  // the whole page. The list itself is read client-side in PurchaseRequestsPage via
  // useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        purchaseRequestsQueryOptions(
          purchaseRequestsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(departmentOptionsQueryOptions()),
    ]),
  component: PurchaseRequestsPage,
  pendingComponent: PageLoading,
})
