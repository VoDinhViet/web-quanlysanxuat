import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "items:create"),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
  component: CreateProductPage,
  pendingComponent: PageLoading,
})
