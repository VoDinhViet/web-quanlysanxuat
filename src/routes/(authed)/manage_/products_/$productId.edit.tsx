import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { EditProductPage } from "@/features/products/pages/EditProductPage"
import { getClientOptions } from "@/features/products/server-functions/get-client-options"
import { getProduct } from "@/features/products/server-functions/get-product"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getUnitOptions } from "@/features/products/server-functions/get-unit-options"

export const Route = createFileRoute(
  "/(authed)/manage_/products_/$productId/edit"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:update"),
  loader: async ({ params }) => {
    const [product, unitOptions, productGroupOptions, clientOptions] =
      await Promise.all([
        getProduct({ data: { productId: params.productId } }),
        getUnitOptions(),
        getProductGroupFilterOptions(),
        getClientOptions(),
      ])

    return { product, unitOptions, productGroupOptions, clientOptions }
  },
  component: EditProductPage,
})
