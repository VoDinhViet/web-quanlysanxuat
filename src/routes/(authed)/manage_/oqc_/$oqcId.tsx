import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { oqcQueryOptions } from "@/features/oqc/api/options"
import { OqcDetailPage } from "@/features/oqc/pages/OqcDetailPage"

export const Route = createFileRoute("/(authed)/manage_/oqc_/$oqcId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(oqcQueryOptions(params.oqcId)),
  component: OqcDetailPage,
  pendingComponent: PageLoading,
})
