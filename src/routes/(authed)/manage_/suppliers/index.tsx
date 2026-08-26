import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { countryOptionsQueryOptions } from "@/features/countries/api"
import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage"
import { suppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import {
  supplierGroupOptionsQueryOptions,
  supplierStatsQueryOptions,
  suppliersQueryOptions,
} from "@/features/suppliers/api/options"

export const Route = createFileRoute("/(authed)/manage_/suppliers/")({
  validateSearch: suppliersSearchSchema,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,

  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in SuppliersPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) => {
    // Stats are a secondary block on this page (SupplierStatCards) — seed the
    // cache without blocking the route/table on it.
    void context.queryClient.prefetchQuery(supplierStatsQueryOptions())

    return Promise.all([
      context.queryClient.ensureQueryData(
        suppliersQueryOptions(suppliersSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(supplierGroupOptionsQueryOptions()),
      context.queryClient.ensureQueryData(countryOptionsQueryOptions()),
    ])
  },
  component: SuppliersPage,
})
