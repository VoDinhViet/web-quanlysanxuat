import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { outsourcingOrdersQueryOptions } from "@/features/outsourcing-orders/api/options"
import { OutsourcingOrdersPage } from "@/features/outsourcing-orders/pages/OutsourcingOrdersPage"
import { outsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/outsourcing-orders")({
  validateSearch: outsourcingOrdersSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      outsourcingOrdersQueryOptions(
        outsourcingOrdersSearchSchema.parse(location.search)
      )
    ),

  component: OutsourcingOrdersPage,
  pendingComponent: PageLoading,
})
