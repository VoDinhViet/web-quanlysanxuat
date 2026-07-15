import { createFileRoute } from "@tanstack/react-router"

import { ProductsPage } from "@/features/products/pages/products-page"
import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { getProductGroupFilterOptions } from "@/features/products/server-functions/get-product-group-filter-options"
import { getProducts } from "@/features/products/server-functions/get-products"

export const Route = createFileRoute("/(authed)/manage_/products")({
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
