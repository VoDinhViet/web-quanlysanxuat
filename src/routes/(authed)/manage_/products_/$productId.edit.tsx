import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditProductPage } from "@/features/products/pages/EditProductPage"
import {
  productGroupOptionsQueryOptions,
  productQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

export const Route = createFileRoute(
  "/(authed)/manage_/products_/$productId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:update"),
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productQueryOptions(params.productId)
      ),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions()),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
    ]),
  component: EditProductPage,
})
