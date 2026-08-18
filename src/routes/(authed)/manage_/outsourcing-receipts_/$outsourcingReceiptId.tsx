import { createFileRoute } from "@tanstack/react-router"

import { PageLoading } from "@/components/shared/feedback/PageLoading"
import {
  outsourcingReceiptItemsQueryOptions,
  outsourcingReceiptQueryOptions,
} from "@/features/outsourcing-receipts/api/options"
import { OutsourcingReceiptDetailPage } from "@/features/outsourcing-receipts/pages/OutsourcingReceiptDetailPage"

export const Route = createFileRoute(
  "/(authed)/manage_/outsourcing-receipts_/$outsourcingReceiptId"
)({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        outsourcingReceiptQueryOptions(params.outsourcingReceiptId)
      ),
      context.queryClient.ensureQueryData(
        outsourcingReceiptItemsQueryOptions(params.outsourcingReceiptId)
      ),
    ]),
  component: OutsourcingReceiptDetailPage,
  pendingComponent: PageLoading,
})
