import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { CreateConsumablePage } from "@/features/consumables/pages/CreateConsumablePage"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/consumables_/create/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.query({
        ...unitOptionsQueryOptions("CONSUMABLE"),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: CreateConsumablePage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
