import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { getClientOptions } from "@/features/products/server-functions/get-client-options"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getProductStats } from "@/features/products/server-functions/get-product-stats"
import { getProducts } from "@/features/products/server-functions/get-products"

export const Route = createFileRoute("/(authed)/manage_/products")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:read"),
  validateSearch: productsSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [products, stats, productGroupOptions, clientOptions] =
      await Promise.all([
        getProducts({ data: deps }),
        getProductStats(),
        getProductGroupFilterOptions(),
        getClientOptions(),
      ])

    return { products, stats, productGroupOptions, clientOptions }
  },
  component: ProductsPage,
})
