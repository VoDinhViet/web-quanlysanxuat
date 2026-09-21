import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { UpdateConsumablePage } from "@/features/consumables/pages/UpdateConsumablePage"
import { consumableQueryOptions } from "@/features/consumables/api/options"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute(
  "/(authed)/manage_/consumables_/$consumableId/update"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...consumableQueryOptions(params.consumableId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...unitOptionsQueryOptions(),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: UpdateConsumablePage,
  pendingComponent: LayoutPagePending,
})
