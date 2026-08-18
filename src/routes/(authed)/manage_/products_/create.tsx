import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
  component: CreateProductPage,
  pendingComponent: PageLoading,
})
