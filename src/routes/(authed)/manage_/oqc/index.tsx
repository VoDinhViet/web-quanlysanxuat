import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import { oqcsQueryOptions } from "@/features/oqc/api/options"
import { OqcPage } from "@/features/oqc/pages/OqcPage"
import { oqcSearchSchema } from "@/features/oqc/schemas/oqc-search.schema"

export const Route = createFileRoute("/(authed)/manage_/oqc/")({
  validateSearch: oqcSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the outlet. The list itself is read client-side in
  // OqcPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.query({
      ...oqcsQueryOptions(oqcSearchSchema.parse(location.search)),
      staleTime: "static",
    }),
  component: OqcPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
