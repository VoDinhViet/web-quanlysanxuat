import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { clientOptionsQueryOptions } from "@/features/clients/api"
import { itemsQueryOptions } from "@/features/products/api/options"
import { ProductsPage } from "@/features/products/pages/ProductsPage"
import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"

export const Route = createFileRoute("/(authed)/manage_/products/")({
  validateSearch: productsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in ProductsPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        itemsQueryOptions(productsSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: ProductsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
