import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/feedback/PagePending"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { OperationsPage } from "@/features/operations/pages/OperationsPage"
import { operationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"

export const Route = createFileRoute("/(authed)/manage_/operations/")({
  validateSearch: operationsSearchSchema,
  // No loaderDeps: a search-box navigation must not create a new route match — see
  // `(authed)/manage_/units/index.tsx`, the pattern this mirrors.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      operationsQueryOptions(operationsSearchSchema.parse(location.search))
    ),
  component: OperationsPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
