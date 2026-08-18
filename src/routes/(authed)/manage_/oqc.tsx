import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { oqcsQueryOptions } from "@/features/oqc/api/options"
import { OqcPage } from "@/features/oqc/pages/OqcPage"
import { oqcSearchSchema } from "@/features/oqc/schemas/oqc-search.schema"

export const Route = createFileRoute("/(authed)/manage_/oqc")({
  validateSearch: oqcSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the whole page. The list itself is read client-side in
  // OqcPage via useQuery instead.
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      oqcsQueryOptions(oqcSearchSchema.parse(location.search))
    ),
  component: OqcPage,
  pendingComponent: PageLoading,
})
