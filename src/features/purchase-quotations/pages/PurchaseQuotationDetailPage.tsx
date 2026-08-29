import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationDetailHeader } from "@/features/purchase-quotations/components/layouts/PurchaseQuotationDetailHeader"
import { PurchaseQuotationDetailQuotesSection } from "@/features/purchase-quotations/components/sections/PurchaseQuotationDetailQuotesSection"
import { PurchaseQuotationDetailTimelineCard } from "@/features/purchase-quotations/components/composites/PurchaseQuotationDetailTimelineCard"
import { PurchaseQuotationGeneratedOrdersCard } from "@/features/purchase-quotations/components/composites/PurchaseQuotationGeneratedOrdersCard"
import { PurchaseQuotationRejectionNotice } from "@/features/purchase-quotations/components/composites/PurchaseQuotationRejectionNotice"

export function PurchaseQuotationDetailPage() {
  const { purchaseQuotationId } = useParams({
    from: "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId",
  })

  const { data: purchaseQuotation } = useSuspenseQuery(
    purchaseQuotationQueryOptions(purchaseQuotationId)
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết báo giá NCC"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Báo giá NCC", href: "/manage/purchase-quotations" },
          { label: purchaseQuotation.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseQuotationRejectionNotice
          purchaseQuotation={purchaseQuotation}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <PurchaseQuotationDetailHeader
              purchaseQuotation={purchaseQuotation}
            />
            <PurchaseQuotationDetailQuotesSection
              purchaseQuotation={purchaseQuotation}
            />
          </Surface>

          <div className="flex flex-col gap-4">
            <PurchaseQuotationDetailTimelineCard
              purchaseQuotation={purchaseQuotation}
            />
            <PurchaseQuotationGeneratedOrdersCard
              purchaseQuotation={purchaseQuotation}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
