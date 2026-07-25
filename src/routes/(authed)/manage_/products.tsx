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
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and the router's
  // defaultPendingComponent, blanking the whole page). The list itself is
  // read client-side in ProductsPage via useQuery instead. `location.search`
  // is already the router-validated search at runtime, but LoaderFnContext
  // types it as `{}` (loaderDeps-independent) — re-parsing it is a type-safe
  // way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        productsQueryOptions(productsSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(productGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: ProductsPage,
})
