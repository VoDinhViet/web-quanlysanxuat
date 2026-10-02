import { CheckCircle, CloseCircle, Lock } from "@solar-icons/react"

import { PermissionGate } from "@/components/shared/primitives/PermissionGate"
import { Button } from "@/components/ui/button"
import { PurchaseOrderCancelDialog } from "@/features/purchase-orders/components/composites/PurchaseOrderCancelDialog"
import { PurchaseOrderCloseDialog } from "@/features/purchase-orders/components/composites/PurchaseOrderCloseDialog"
import { PurchaseOrderConfirmDialog } from "@/features/purchase-orders/components/composites/PurchaseOrderConfirmDialog"
import {
  PurchaseOrderProgress,
  PurchaseOrderStatus,
} from "@/lib/types/purchase-order.type"
import type { PurchaseOrderDetail } from "@/lib/types/purchase-order.type"

type PurchaseOrderDetailActionsProps = {
  purchaseOrder: PurchaseOrderDetail
}

// Header-level status actions. Xác nhận đặt hàng dùng `purchasing:update` (cùng quyền sửa PO);
// Huỷ PO dùng `purchasing:approve` (khác quyền sửa — backend đòi rõ ràng), nên 2 nút đứng cạnh
// nhau khi DRAFT thay vì gộp vào 1 status switch như PurchaseQuotationDetailActions.tsx.
export function PurchaseOrderDetailActions({
  purchaseOrder,
}: PurchaseOrderDetailActionsProps) {
  const isConfirmable =
    purchaseOrder.status === PurchaseOrderStatus.PENDING_CONFIRMATION &&
    purchaseOrder.expectedDate !== null &&
    purchaseOrder.items.every((item) => item.unitPrice !== null)

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        {purchaseOrder.status === PurchaseOrderStatus.PENDING_CONFIRMATION && (
          <PermissionGate permission="purchasing:update">
            <PurchaseOrderConfirmDialog
              purchaseOrder={purchaseOrder}
              trigger={
                <Button type="button" disabled={!isConfirmable}>
                  <CheckCircle className="size-4" />
                  Xác nhận đặt hàng
                </Button>
              }
            />
          </PermissionGate>
        )}

        {(purchaseOrder.canClose ||
          purchaseOrder.closeBlockedBy.length > 0) && (
          <PermissionGate permission="purchasing:approve">
            <PurchaseOrderCloseDialog
              purchaseOrder={purchaseOrder}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  disabled={!purchaseOrder.canClose}
                  title={
                    purchaseOrder.canClose
                      ? "Chốt phần đã nhập, bỏ phần chưa về"
                      : `Còn phiếu nhập chưa ghi sổ: ${purchaseOrder.closeBlockedBy
                          .map((receipt) => receipt.code)
                          .join(", ")}`
                  }
                >
                  <Lock className="size-4" />
                  Đóng sớm PO
                </Button>
              }
            />
          </PermissionGate>
        )}

        {purchaseOrder.status !== PurchaseOrderStatus.CANCELLED &&
          purchaseOrder.progress !== PurchaseOrderProgress.COMPLETED && (
            <PermissionGate permission="purchasing:approve">
              <PurchaseOrderCancelDialog
                purchaseOrder={purchaseOrder}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive/40 text-destructive"
                  >
                    <CloseCircle className="size-4" />
                    Huỷ PO
                  </Button>
                }
              />
            </PermissionGate>
          )}
      </div>

      {purchaseOrder.status === PurchaseOrderStatus.PENDING_CONFIRMATION &&
        !isConfirmable && (
          <p className="max-w-64 text-right text-[11px] text-muted-foreground">
            Cần nhập ngày giao dự kiến và đơn giá cho mọi dòng trước khi xác
            nhận.
          </p>
        )}
    </div>
  )
}
