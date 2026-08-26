import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { operationsQueryOptions } from "@/features/operations/api/options"
import { OperationsPage } from "@/features/operations/pages/OperationsPage"
import { operationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"

export const Route = createFileRoute("/(authed)/manage_/operations")({
  validateSearch: operationsSearchSchema,
  // No loaderDeps: a search-box navigation must not create a new route match — see
  // `(authed)/manage_/units.tsx`, the pattern this mirrors.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      operationsQueryOptions(operationsSearchSchema.parse(location.search))
    ),
  component: OperationsPage,
  pendingComponent: PageLoading,
})
