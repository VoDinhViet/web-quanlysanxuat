import { createFileRoute } from "@tanstack/react-router"

import { requirePermission } from "@/features/auth/guard"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { clientOptionsQueryOptions } from "@/features/products/queries/client-options.query"
import { productGroupOptionsQueryOptions } from "@/features/products/queries/product-group-options.query"
import { productsQueryOptions } from "@/features/products/queries/products.query"
import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"

export const Route = createFileRoute("/(authed)/manage_/products")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "products:read"),
  validateSearch: productsSearchSchema,
  loaderDeps: ({ search }) => search,
  // Prefetch into the query cache (SSR); the page reads the same options via
  // useSuspenseQuery — see .claude/rules/architecture.md.
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions(deps)),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: ProductsPage,
})
