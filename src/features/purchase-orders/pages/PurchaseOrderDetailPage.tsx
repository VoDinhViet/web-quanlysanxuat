import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layouts/PageTitleBar"
import { Surface } from "@/components/shared/layouts/Surface"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrderCancellationNotice } from "@/features/purchase-orders/components/composites/PurchaseOrderCancellationNotice"
import { PurchaseOrderDetailHeader } from "@/features/purchase-orders/components/layouts/PurchaseOrderDetailHeader"
import { PurchaseOrderDetailTimelineCard } from "@/features/purchase-orders/components/composites/PurchaseOrderDetailTimelineCard"
import { PurchaseOrderItemsSection } from "@/features/purchase-orders/components/sections/PurchaseOrderItemsSection"
import { PurchaseOrderStatusLegend } from "@/features/purchase-orders/components/composites/PurchaseOrderStatusLegend"
import { PurchaseOrderSummaryCard } from "@/features/purchase-orders/components/composites/PurchaseOrderSummaryCard"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"

export function PurchaseOrderDetailPage() {
  const { purchaseOrderId } = useParams({
    from: "/(authed)/manage_/purchase-orders_/$purchaseOrderId",
  })

  const { data: purchaseOrder } = useSuspenseQuery(
    purchaseOrderQueryOptions(purchaseOrderId)
  )

  // Header fields (assignee/paymentTerm/note/expectedDate) + item fields (SL đặt/đơn giá/lý do
  // điều chỉnh SL) đều chỉ sửa được khi còn DRAFT. Xác nhận đặt hàng/Huỷ PO
  // (PurchaseOrderDetailActions.tsx) kiểm quyền riêng của chính mình, không phụ thuộc `editable`.
  const editable =
    useHasPermission("purchasing:update") &&
    purchaseOrder.status === PurchaseOrderStatus.DRAFT

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn mua hàng"
        breadcrumbs={[
          { label: "Bảng điều khiển", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đơn mua hàng (PO)", href: "/manage/purchase-orders" },
          { label: purchaseOrder.code },
        ]}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseOrderCancellationNotice purchaseOrder={purchaseOrder} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <PurchaseOrderDetailHeader
              purchaseOrder={purchaseOrder}
              editable={editable}
            />
            <PurchaseOrderItemsSection
              purchaseOrder={purchaseOrder}
              editable={editable}
            />
          </Surface>

          <div className="flex flex-col gap-4">
            <PurchaseOrderDetailTimelineCard purchaseOrder={purchaseOrder} />
            <PurchaseOrderSummaryCard purchaseOrder={purchaseOrder} />
            <PurchaseOrderStatusLegend />
          </div>
        </div>
      </div>
    </main>
  )
}
