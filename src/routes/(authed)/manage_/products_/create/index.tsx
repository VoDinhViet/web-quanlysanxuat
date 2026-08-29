import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/create/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
  component: CreateProductPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
