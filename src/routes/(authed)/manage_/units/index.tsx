import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
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
    return context.queryClient.query({
      ...unitsQueryOptions(unitsSearchSchema.parse(location.search)),
      staleTime: "static",
    })
  },
  component: UnitsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
