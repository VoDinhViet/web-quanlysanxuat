import { createFileRoute } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
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
      context.queryClient.query({
        ...outsourcingReceiptQueryOptions(params.outsourcingReceiptId),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...outsourcingReceiptItemsQueryOptions(params.outsourcingReceiptId),
        staleTime: "static",
      }),
    ]),
  component: OutsourcingReceiptDetailPage,
  pendingComponent: LayoutPagePending,
})
