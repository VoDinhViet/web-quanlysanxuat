import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { ProductDetailPage } from "@/features/products/pages/ProductDetailPage"
import { productDetailSearchSchema } from "@/features/products/schemas/product-detail-search.schema"
import { itemQueryOptions } from "@/features/products/api/options"
import { unitOptionsQueryOptions } from "@/features/units/api"

// Guarded on `items:read`, not `items:update`: a read-only viewer should
// reach this screen. The write actions gate themselves with PermissionGate.
export const Route = createFileRoute("/(authed)/manage_/products_/$productId")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "items:read"),
  validateSearch: productDetailSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(itemQueryOptions(params.productId)),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
    ]),
  component: ProductDetailPage,
  pendingComponent: PageLoading,
})
