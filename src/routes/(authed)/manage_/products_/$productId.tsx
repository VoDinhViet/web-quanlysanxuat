import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/feedback/LayoutPagePending"
import { ProductDetailPage } from "@/features/products/pages/ProductDetailPage"
import { productDetailSearchSchema } from "@/features/products/schemas/product-detail-search.schema"
import { itemQueryOptions } from "@/features/products/api/options"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/$productId")({
  validateSearch: productDetailSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(itemQueryOptions(params.productId)),
      context.queryClient.ensureQueryData(unitOptionsQueryOptions("PRODUCT")),
    ]),
  component: ProductDetailPage,
  pendingComponent: LayoutPagePending,
})
