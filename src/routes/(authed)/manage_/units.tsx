import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { unitsQueryOptions } from "@/features/units/api/options"
import { UnitsPage } from "@/features/units/pages/UnitsPage"
import { unitsSearchSchema } from "@/features/units/schemas/units-search.schema"

export const Route = createFileRoute("/(authed)/manage_/units")({
  validateSearch: unitsSearchSchema,
  // No loaderDeps: a search-box navigation must not create a new route match (that would
  // re-trigger this loader and the router's defaultPendingComponent, blanking the whole page).
  // The list itself is read client-side in UnitsPage via useQuery instead — see
  // `(authed)/manage_/clients.tsx`, the pattern this mirrors.
  loader: ({ context, location }) => {
    // UnitStatCards reads the unfiltered catalog on its own (mirrors suppliers'
    // SupplierStatCards) — seed the cache without blocking the route/grid on it.
    void context.queryClient.prefetchQuery(unitsQueryOptions({}))

    return context.queryClient.ensureQueryData(
      unitsQueryOptions(unitsSearchSchema.parse(location.search))
    )
  },
  component: UnitsPage,
  pendingComponent: PageLoading,
})
