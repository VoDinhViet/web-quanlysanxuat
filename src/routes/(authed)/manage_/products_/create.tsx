import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import {
  productGroupOptionsQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:create"),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(unitOptionsQueryOptions()),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
    ]),
  component: CreateProductPage,
})
