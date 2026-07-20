import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ProductDetailPage } from "@/features/products/pages/ProductDetailPage"
import { productDetailSearchSchema } from "@/features/products/schemas/product-detail-search.schema"
import {
  productGroupOptionsQueryOptions,
  productQueryOptions,
  unitOptionsQueryOptions,
} from "@/features/products/products.query"

// Guarded on `products:read`, not `products:update`: a read-only viewer should
// reach this screen. The write actions gate themselves with PermissionGate.
export const Route = createFileRoute("/(authed)/manage_/products_/$productId")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:read"),
  validateSearch: productDetailSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productQueryOptions(params.productId)
      ),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions()),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
    ]),
  component: ProductDetailPage,
})
