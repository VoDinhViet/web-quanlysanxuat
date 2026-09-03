import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { ProductDetailPage } from "@/features/products/pages/ProductDetailPage"
import { productDetailSearchSchema } from "@/features/products/schemas/product-detail-search.schema"
import { itemQueryOptions } from "@/features/products/api/options"
import { unitOptionsQueryOptions } from "@/features/units/api"

export const Route = createFileRoute("/(authed)/manage_/products_/$productId")({
  validateSearch: productDetailSearchSchema,
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.query({
        ...itemQueryOptions(params.productId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...unitOptionsQueryOptions("PRODUCT"),
        staleTime: "static",
      }),
    ]),
  component: ProductDetailPage,
  pendingComponent: LayoutPagePending,
})
