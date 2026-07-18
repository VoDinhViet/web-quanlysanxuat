import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getProducts } from "@/features/products/server-functions/get-products"

export const Route = createFileRoute("/(authed)/manage_/products")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:read"),
  validateSearch: productsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [products, productGroupOptions] = await Promise.all([
      getProducts({ data: deps }),
      getProductGroupFilterOptions(),
    ])

    return { products, productGroupOptions }
  },
  component: ProductsPage,
})
