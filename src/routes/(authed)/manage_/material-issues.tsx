import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { materialIssuesQueryOptions } from "@/features/material-issues/api/options"
import { MaterialIssuesPage } from "@/features/material-issues/pages/MaterialIssuesPage"
import { materialIssuesSearchSchema } from "@/features/material-issues/schemas/material-issues-search.schema"

export const Route = createFileRoute("/(authed)/manage_/material-issues")({
  validateSearch: materialIssuesSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match (that would
  // re-trigger this loader and the router's pendingComponent, blanking the whole page). The list
  // itself is read client-side in MaterialIssuesPage via useQuery instead — same idiom as
  // inventory-issues.tsx.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      materialIssuesQueryOptions(
        materialIssuesSearchSchema.parse(location.search)
      )
    ),
  component: MaterialIssuesPage,
  pendingComponent: PageLoading,
})
