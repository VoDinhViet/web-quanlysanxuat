import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { outsourcingReceiptsQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptsPage } from "@/features/outsourcing-receipts/pages/OutsourcingReceiptsPage"
import { outsourcingReceiptsSearchSchema } from "@/features/outsourcing-receipts/schemas/outsourcing-receipts-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/outsourcing-receipts/")(
  {
    validateSearch: outsourcingReceiptsSearchSchema,
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
    // The parent route.tsx already renders the real PageTitleBar and never
    // pends, so this only needs to blank the content area — not
    // LayoutPagePending's full-page header placeholder, which would stack
    // under the real one.
    pendingComponent: PagePending,
  }
)
