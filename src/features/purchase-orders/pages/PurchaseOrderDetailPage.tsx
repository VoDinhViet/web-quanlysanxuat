import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/PageTitleBar"
import { Surface } from "@/components/shared/Surface"
import { purchaseOrderQueryOptions } from "@/features/purchase-orders/api/options"
import { PurchaseOrderCancellationNotice } from "@/features/purchase-orders/components/detail/PurchaseOrderCancellationNotice"
import { PurchaseOrderDetailHeader } from "@/features/purchase-orders/components/detail/PurchaseOrderDetailHeader"
import { PurchaseOrderDetailTimelineCard } from "@/features/purchase-orders/components/detail/PurchaseOrderDetailTimelineCard"
import { PurchaseOrderItemsSection } from "@/features/purchase-orders/components/detail/PurchaseOrderItemsSection"
import { PurchaseOrderStatusLegend } from "@/features/purchase-orders/components/detail/PurchaseOrderStatusLegend"
import { PurchaseOrderSummaryCard } from "@/features/purchase-orders/components/detail/PurchaseOrderSummaryCard"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseOrderStatus } from "@/lib/types/purchase-order.type"

export function PurchaseOrderDetailPage() {
  const { purchaseOrderId } = useParams({
    from: "/(authed)/manage_/purchase-orders_/$purchaseOrderId",
  })

  const { data: detail } = useSuspenseQuery(
    purchaseOrderQueryOptions(purchaseOrderId)
  )

  // Header fields (assignee/paymentTerm/receiptWarehouse/note/expectedDate) + item fields (SL
  // đặt/đơn giá/lý do điều chỉnh SL) đều chỉ sửa được khi còn DRAFT. Xác nhận đặt hàng/Huỷ PO
  // (PurchaseOrderDetailActions.tsx) kiểm quyền riêng của chính mình, không phụ thuộc `editable`.
  const editable =
    useHasPermission("purchasing:update") &&
    detail.status === PurchaseOrderStatus.DRAFT

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đơn mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đơn mua hàng (PO)", href: "/manage/purchase-orders" },
          { label: detail.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseOrderCancellationNotice detail={detail} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <PurchaseOrderDetailHeader detail={detail} editable={editable} />
            <PurchaseOrderItemsSection detail={detail} editable={editable} />
          </Surface>

          <div className="flex flex-col gap-4">
            <PurchaseOrderDetailTimelineCard detail={detail} />
            <PurchaseOrderSummaryCard detail={detail} />
            <PurchaseOrderStatusLegend />
          </div>
        </div>
      </div>
    </main>
  )
}
