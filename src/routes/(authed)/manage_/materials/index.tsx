import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { MaterialsPage } from "@/features/materials/pages/MaterialsPage"
import { materialsQueryOptions } from "@/features/materials/api/options"
import { materialsSearchSchema } from "@/features/materials/schemas/materials-search.schema"
import { clientOptionsQueryOptions } from "@/features/clients/api"

export const Route = createFileRoute("/(authed)/manage_/materials/")({
  validateSearch: materialsSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route
  // match (that would re-trigger this loader and blank the outlet). The list
  // itself is read client-side in MaterialsPage via useQuery instead.
  // `location.search` is already the router-validated search at runtime, but
  // LoaderFnContext types it as `{}` (loaderDeps-independent) — re-parsing it
  // is a type-safe way to recover the real shape, not an `as` cast.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        materialsQueryOptions(materialsSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(clientOptionsQueryOptions("")),
    ]),
  component: MaterialsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
