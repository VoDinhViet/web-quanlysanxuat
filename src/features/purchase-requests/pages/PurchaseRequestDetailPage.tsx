import { useParams } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { PageTitleBar } from "@/components/shared/layout/PageTitleBar"
import { Surface } from "@/components/shared/layout/Surface"
import { purchaseRequestQueryOptions } from "@/features/purchase-requests/api/options"
import { PurchaseRequestDetailHeader } from "@/features/purchase-requests/components/detail/PurchaseRequestDetailHeader"
import { PurchaseRequestItemsSection } from "@/features/purchase-requests/components/detail/PurchaseRequestItemsSection"
import { PurchaseRequestRejectionNotice } from "@/features/purchase-requests/components/detail/PurchaseRequestRejectionNotice"
import { useHasPermission } from "@/hooks/use-permissions"
import { PurchaseRequestStatus } from "@/lib/types/purchase-request.type"

export function PurchaseRequestDetailPage() {
  const { purchaseRequestId } = useParams({
    from: "/(authed)/manage_/purchase-requests_/$purchaseRequestId",
  })

  const { data: purchaseRequest } = useSuspenseQuery(
    purchaseRequestQueryOptions(purchaseRequestId)
  )

  // SL đề xuất/Ghi chú/Xóa dòng đều ghi thật xuống backend giờ — mỗi cell tự chứa mutation riêng
  // và tự invalidate ["purchase-requests"] khi thành công, nên trang không cần giữ bản sao `rows`
  // trong state nữa: đọc thẳng `purchaseRequest.items`, refetch sau invalidate tự resync mọi cột (kể cả 4
  // số tính sống bomDemand/onHand/available/fromStock). `editable` cho phép cả REJECTED — đó là
  // cách duy nhất thoát khỏi REJECTED (sửa/xóa 1 dòng tự đưa status về DRAFT), không chỉ DRAFT.
  const editable =
    useHasPermission("purchase-requests:update") &&
    (purchaseRequest.status === PurchaseRequestStatus.DRAFT ||
      purchaseRequest.status === PurchaseRequestStatus.REJECTED)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <PageTitleBar
        title="Chi tiết đề xuất mua hàng"
        breadcrumbs={[
          { label: "Dashboard", href: "/manage" },
          { label: "Quản lý mua hàng" },
          { label: "Đề xuất mua hàng", href: "/manage/purchase-requests" },
          { label: purchaseRequest.code },
        ]}
        notificationCount={5}
      />

      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:p-6">
        <PurchaseRequestRejectionNotice purchaseRequest={purchaseRequest} />

        <Surface>
          <PurchaseRequestDetailHeader
            purchaseRequest={purchaseRequest}
            itemCount={purchaseRequest.items.length}
          />
          <PurchaseRequestItemsSection
            rows={purchaseRequest.items}
            editable={editable}
          />
        </Surface>
      </div>
    </main>
  )
}
