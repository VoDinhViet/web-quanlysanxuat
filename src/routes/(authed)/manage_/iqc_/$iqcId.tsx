import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { iqcQueryOptions } from "@/features/iqc/api/options"
import { IqcDetailPage } from "@/features/iqc/pages/IqcDetailPage"

// No `validateSearch` — a single always-visible card, same as purchase-orders_/$purchaseOrderId.
export const Route = createFileRoute("/(authed)/manage_/iqc_/$iqcId")({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "iqc:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(iqcQueryOptions(params.iqcId)),
  component: IqcDetailPage,
  pendingComponent: PageLoading,
})
