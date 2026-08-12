import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PendingAction } from "@/components/shared/PendingAction"

// Sticky footer, same shell as PurchaseQuotationApprovalBar.tsx (the only sticky-footer
// precedent in the repo). None of Hủy phiếu/Lưu/Xác nhận xuất have a backend route yet (the
// module only exposes GET list + GET detail) — stay disabled with a tooltip via PendingAction.
// In phiếu is real (window.print()), duplicated from the header per the mockup.
export function SupplierReturnDetailActions() {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-4 py-4 sm:px-5 print:hidden">
      <PendingAction
        label="Hủy phiếu"
        hint="chưa có API hủy phiếu"
        variant="destructive"
      >
        Hủy phiếu
      </PendingAction>
      <PendingAction label="Lưu" hint="chưa có API lưu chỉnh sửa">
        Lưu
      </PendingAction>
      <PendingAction
        label="Xác nhận xuất"
        hint="chưa có API xác nhận xuất"
        variant="default"
      >
        Xác nhận xuất
      </PendingAction>
      <Button type="button" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        In phiếu
      </Button>
    </div>
  )
}
