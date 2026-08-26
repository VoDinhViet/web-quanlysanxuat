import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { unitsQueryOptions } from "@/features/units/api/options"
import { UnitsPage } from "@/features/units/pages/UnitsPage"
import { unitsSearchSchema } from "@/features/units/schemas/units-search.schema"

export const Route = createFileRoute("/(authed)/manage_/units/")({
  validateSearch: unitsSearchSchema,
  // No loaderDeps: a search-box navigation must not create a new route match (that would
  // re-trigger this loader and blank the outlet). The list itself is read client-side in
  // UnitsPage via useQuery instead — see `(authed)/manage_/clients/index.tsx`, the pattern
  // this mirrors.
  loader: ({ context, location }) => {
    // UnitStatCards reads the unfiltered catalog on its own (mirrors suppliers'
    // SupplierStatCards) — seed the cache without blocking the route/grid on it.
    void context.queryClient.prefetchQuery(unitsQueryOptions({}))

    return context.queryClient.ensureQueryData(
      unitsQueryOptions(unitsSearchSchema.parse(location.search))
    )
  },
  component: UnitsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
