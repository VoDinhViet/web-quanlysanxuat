import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrdersPage } from "@/features/outbound-orders/pages/OutboundOrdersPage"
import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/outbound-orders")({
  validateSearch: outboundOrdersSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      outboundOrdersQueryOptions(
        outboundOrdersSearchSchema.parse(location.search)
      )
    ),

  component: OutboundOrdersPage,
  pendingComponent: PageLoading,
})
