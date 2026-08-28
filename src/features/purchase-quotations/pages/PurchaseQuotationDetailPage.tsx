import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { purchaseQuotationQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationDetailHeader } from "@/features/purchase-quotations/components/detail/PurchaseQuotationDetailHeader"
import { PurchaseQuotationDetailQuotesSection } from "@/features/purchase-quotations/components/detail/PurchaseQuotationDetailQuotesSection"
import { PurchaseQuotationDetailTimelineCard } from "@/features/purchase-quotations/components/detail/PurchaseQuotationDetailTimelineCard"
import { PurchaseQuotationGeneratedOrdersCard } from "@/features/purchase-quotations/components/detail/PurchaseQuotationGeneratedOrdersCard"
import { PurchaseQuotationRejectionNotice } from "@/features/purchase-quotations/components/detail/PurchaseQuotationRejectionNotice"

export function PurchaseQuotationDetailPage() {
  const { purchaseQuotationId } = useParams({
    from: "/(authed)/manage_/purchase-quotations_/$purchaseQuotationId",
  })

  const { data: detail } = useSuspenseQuery(
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
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseQuotationRejectionNotice detail={detail} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <PurchaseQuotationDetailHeader detail={detail} />
            <PurchaseQuotationDetailQuotesSection detail={detail} />
          </Surface>

          <div className="flex flex-col gap-4">
            <PurchaseQuotationDetailTimelineCard detail={detail} />
            <PurchaseQuotationGeneratedOrdersCard detail={detail} />
          </div>
        </div>
      </div>
    </main>
  )
}
