import { createFileRoute } from "@tanstack/react-router"

import { PagePending } from "@/components/shared/layouts/PagePending"
import {
  iqcStatsQueryOptions,
  iqcsQueryOptions,
} from "@/features/iqc/api/options"
import { IqcPage } from "@/features/iqc/pages/IqcPage"
import { iqcSearchSchema } from "@/features/iqc/schemas/iqc-search.schema"
import { supplierOptionsQueryOptions } from "@/features/suppliers/api"

export const Route = createFileRoute("/(authed)/manage_/iqc/")({
  validateSearch: iqcSearchSchema,
  // No loaderDeps: a filter/pagination navigation must not create a new route match, which would
  // re-trigger this loader and blank the outlet. The list itself is read client-side in
  // IqcPage via useQuery instead.
  loader: ({ context, location }) =>
    Promise.all([
      context.queryClient.query({
        ...iqcsQueryOptions(iqcSearchSchema.parse(location.search)),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...iqcStatsQueryOptions(),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...supplierOptionsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: IqcPage,
  // The parent route.tsx already renders the real PageTitleBar and never
  // pends, so this only needs to blank the content area — not
  // LayoutPagePending's full-page header placeholder, which would stack
  // under the real one.
  pendingComponent: PagePending,
})
