import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { countryOptionsQueryOptions } from "@/features/countries/api"
import { SuppliersPage } from "@/features/suppliers/pages/SuppliersPage"
import { suppliersSearchSchema } from "@/features/suppliers/schemas/suppliers-search.schema"
import {
  supplierGroupOptionsQueryOptions,
  supplierStatsQueryOptions,
  suppliersQueryOptions,
} from "@/features/suppliers/api/options"

export const Route = createFileRoute("/(authed)/manage_/suppliers")({
  validateSearch: suppliersSearchSchema,
  pendingComponent: PageLoading,

  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and the router's
  // defaultPendingComponent, blanking the whole page). The list itself is
  // read client-side in SuppliersPage via useQuery instead. `location.search`
  // is already the router-validated search at runtime, but LoaderFnContext
  // types it as `{}` (loaderDeps-independent) — re-parsing it is a type-safe
  // way to recover the real shape, not an `as` cast.
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
