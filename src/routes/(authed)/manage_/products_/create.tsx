import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import { productGroupOptionsQueryOptions } from "@/features/products/api/products.options"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
    ]),
  component: CreateProductPage,
  pendingComponent: PageLoading,
})
