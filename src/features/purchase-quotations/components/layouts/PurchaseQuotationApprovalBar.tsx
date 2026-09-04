import { CloseCircle } from "@solar-icons/react"

import { Button } from "@/components/ui/button"
import { ApproveQuotationDialog } from "@/features/purchase-quotations/components/composites/ApproveQuotationDialog"
import { RejectQuotationDialog } from "@/features/purchase-quotations/components/composites/RejectQuotationDialog"
import type {
  PurchaseQuotationDetail,
  PurchaseQuotationSupplierSelection,
} from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationApprovalBarProps = {
  purchaseQuotation: PurchaseQuotationDetail
  selectedSuppliers: PurchaseQuotationSupplierSelection
  totalItems: number
}

// Sticky decision bar shown only while selecting suppliers (PENDING_APPROVAL +
// purchasing:approve — see PurchaseQuotationDetailQuotesSection's `selectable`). Từ chối is
// always available; Duyệt is gated on having picked exactly one NCC per vật tư, mirroring the
// backend's all-or-nothing `supplier_not_selected` rule client-side for a smoother flow (the
// backend still re-validates).
export function PurchaseQuotationApprovalBar({
  purchaseQuotation,
  selectedSuppliers,
  totalItems,
}: PurchaseQuotationApprovalBarProps) {
  const selectedItemCount = Object.keys(selectedSuppliers).length
  const distinctSupplierCount = new Set(Object.values(selectedSuppliers)).size
  const isComplete = selectedItemCount === totalItems && totalItems > 0

  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-4 sm:px-5">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          Đã chọn {selectedItemCount}/{totalItems} vật tư
        </span>
        {selectedItemCount > 0 && (
          <span>
            {" "}
            — sẽ tạo {distinctSupplierCount} đơn mua nháp cho{" "}
            {distinctSupplierCount} NCC
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <RejectQuotationDialog
          purchaseQuotation={purchaseQuotation}
          trigger={
            <Button
              type="button"
              variant="outline"
              className="border-destructive/40 text-destructive"
            >
              <CloseCircle className="size-4" />
              Từ chối
            </Button>
          }
        />
        <ApproveQuotationDialog
          purchaseQuotation={purchaseQuotation}
          selectedSuppliers={selectedSuppliers}
          trigger={
            <Button type="button" isDisabled={!isComplete}>
              Duyệt & tạo đơn mua
            </Button>
          }
        />
      </div>
    </div>
  )
}
