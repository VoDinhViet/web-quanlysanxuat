import { useMemo } from "react"
import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import {
  purchaseQuotationComparisonQueryOptions,
  purchaseQuotationQueryOptions,
} from "@/features/purchase-quotations/api/options"
import { UpdateQuotationForm } from "@/features/purchase-quotations/components/sections/UpdateQuotationForm"

export function UpdateQuotationPage() {
  const { purchaseQuotationId } = useParams({
    from: "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId_/update",
  })

  const { data: purchaseQuotation } = useSuspenseQuery(
    purchaseQuotationQueryOptions(purchaseQuotationId)
  )
  const { data: items } = useSuspenseQuery(
    purchaseQuotationComparisonQueryOptions(purchaseQuotationId)
  )

  const quotationWithItems = useMemo(
    () => ({ ...purchaseQuotation, items }),
    [purchaseQuotation, items]
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Cập nhật RFQ"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Báo giá NCC", href: "/manage/purchase-quotations" },
          { label: purchaseQuotation.code },
          { label: "Cập nhật" },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <UpdateQuotationForm purchaseQuotation={quotationWithItems} />
      </div>
    </main>
  )
}
