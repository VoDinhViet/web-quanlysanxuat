import { createFileRoute } from "@tanstack/react-router"

import { ManagePage } from "@/features/manage/pages/ManagePage"
import { manageSearchSchema } from "@/features/manage/schemas/manage-search.schema"
import { reportStatsQueryOptions } from "@/features/reports/api"

export const Route = createFileRoute("/(authed)/manage")({
  validateSearch: manageSearchSchema,
  // No loaderDeps: changing the date range must not create a new route match (same reasoning as
  // manage_/orders.tsx) — ManageStatCards re-fetches on its own via useQuery reading the current
  // search. This loader only seeds the cache for the first load.
  loader: ({ context, location }) => {
    void context.queryClient.prefetchQuery(
      reportStatsQueryOptions(manageSearchSchema.parse(location.search))
    )
  },
  component: ManagePage,
})
