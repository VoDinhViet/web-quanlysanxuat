import { createFileRoute, redirect } from "@tanstack/react-router"

import { LayoutPagePending } from "@/components/shared/layouts/LayoutPagePending"
import { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
import { UpdateQuotationPage } from "@/features/purchase-quotations/pages/UpdateQuotationPage"
import { PurchaseQuotationStatus } from "@/lib/types/purchase-quotation.type"

export const Route = createFileRoute(
  "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId_/update"
)({
  loader: async ({ context, params }) => {
    const quotation = await context.queryClient.query({
      ...purchaseQuotationQueryOptions(params.purchaseQuotationId),
      staleTime: "static",
    })

    if (quotation.status !== PurchaseQuotationStatus.DRAFT) {
      throw redirect({
        to: "/manage/purchase-quotations/$purchaseQuotationId",
        params: { purchaseQuotationId: params.purchaseQuotationId },
      })
    }
  },
  component: UpdateQuotationPage,
  pendingComponent: LayoutPagePending,
})
