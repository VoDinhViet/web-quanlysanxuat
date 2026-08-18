import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptsPage } from "@/features/outsourcing-receipts/pages/OutsourcingReceiptsPage"
import { outsourcingReceiptsSearchSchema } from "@/features/outsourcing-receipts/schemas/outsourcing-receipts-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/outsourcing-receipts")({
  validateSearch: outsourcingReceiptsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which
  // would re-trigger this loader and blank the whole page. The list itself is read client-side
  // in OutsourcingReceiptsPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        outsourcingReceiptsQueryOptions(
          outsourcingReceiptsSearchSchema.parse(location.search)
        )
      ),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: OutsourcingReceiptsPage,
  pendingComponent: PageLoading,
})
