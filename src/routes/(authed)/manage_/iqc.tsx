import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import {
  iqcStatsQueryOptions,
  iqcsQueryOptions,
} from "@/features/iqc/api/options"
import { IqcPage } from "@/features/iqc/pages/IqcPage"
import { iqcSearchSchema } from "@/features/iqc/schemas/iqc-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/iqc")({
  validateSearch: iqcSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the whole page. The list itself is read client-side in
  // IqcPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        iqcsQueryOptions(iqcSearchSchema.parse(location.search))
      ),
      context.queryClient.ensureQueryData(iqcStatsQueryOptions()),
      context.queryClient.ensureQueryData(supplierOptionsQueryOptions()),
    ]),
  component: IqcPage,
  pendingComponent: PageLoading,
})
