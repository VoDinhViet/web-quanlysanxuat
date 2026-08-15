import { Eye, EllipsisVertical, Printer } from "lucide-react"

import { DisabledAction } from "@/components/shared/DisabledAction"

// No detail route/print/edit API exists for this domain yet (UI-only pass) — every row action
// stays disabled with a tooltip, same idiom as SupplierReturnsTableCells' "Chỉnh sửa".
export function OutsourcingOrderActionsCell() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <DisabledAction label="Xem chi tiết" hint="chưa có trang chi tiết">
        <Eye className="size-3.5" />
      </DisabledAction>
      <DisabledAction label="In phiếu xuất" hint="chưa có tính năng in phiếu">
        <Printer className="size-3.5" />
      </DisabledAction>
      <DisabledAction label="Khác" hint="Sửa, Hủy, Nhân bản — tính năng sắp có">
        <EllipsisVertical className="size-3.5" />
      </DisabledAction>
    </div>
  )
}
