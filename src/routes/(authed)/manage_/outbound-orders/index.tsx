import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { outboundOrdersQueryOptions } from "@/features/outbound-orders/api/options"
import { OutboundOrdersPage } from "@/features/outbound-orders/pages/OutboundOrdersPage"
import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"

export const Route = createFileRoute("/(authed)/manage_/outbound-orders/")({
  validateSearch: outboundOrdersSearchSchema,
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...outboundOrdersQueryOptions(
        outboundOrdersSearchSchema.parse(location.search)
      ),
      staleTime: "static",
    }),
  component: OutboundOrdersPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
