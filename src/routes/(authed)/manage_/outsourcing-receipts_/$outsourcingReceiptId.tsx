import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import { requirePermission } from "@/features/auth/guard"
import { outsourcingReceiptQueryOptions } from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptDetailPage } from "@/features/outsourcing-receipts/pages/OutsourcingReceiptDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-receipts_/$outsourcingReceiptId"
)({
  beforeLoad: ({ context }) =>
    requirePermission(context.permissions, "outsourcing:read"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      outsourcingReceiptQueryOptions(params.outsourcingReceiptId)
    ),
  component: OutsourcingReceiptDetailPage,
  pendingComponent: PageLoading,
})
