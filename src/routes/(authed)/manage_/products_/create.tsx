import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { CreateProductPage } from "@/features/products/pages/CreateProductPage"
import { getClientOptions } from "@/features/products/server-functions/get-client-options"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getUnitOptions } from "@/features/products/server-functions/get-unit-options"

export const Route = createFileRoute("/(authed)/manage_/products_/create")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:create"),
  loader: async () => {
    const [unitOptions, productGroupOptions, clientOptions] = await Promise.all(
      [getUnitOptions(), getProductGroupFilterOptions(), getClientOptions()]
    )

    return { unitOptions, productGroupOptions, clientOptions }
  },
  component: CreateProductPage,
})
