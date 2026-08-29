import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { outsourcingOrdersQueryOptions } from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrdersPage } from "@/features/outsourcing-orders/pages/OutsourcingOrdersPage"
import { outsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/outsourcing-orders/")({
  validateSearch: outsourcingOrdersSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      outsourcingOrdersQueryOptions(
        outsourcingOrdersSearchSchema.parse(location.search)
      )
    ),
  component: OutsourcingOrdersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
