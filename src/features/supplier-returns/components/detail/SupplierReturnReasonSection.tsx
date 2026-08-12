import { MessageSquareWarning } from "lucide-react"

import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"

// No `reason` column exists on `supplier_returns` at all (grep across the backend repo turns up
// nothing) — the whole section flags as not-yet-supported instead of showing a fabricated or
// empty field.
export function SupplierReturnReasonSection() {
  return (
    <SupplierReturnDetailSectionCard
      icon={MessageSquareWarning}
      title="Lý do trả"
    >
      <MissingSectionAlert>
        Chưa có API lưu lý do trả vật tư — mục này sẽ hiển thị khi backend hỗ
        trợ.
      </MissingSectionAlert>
    </SupplierReturnDetailSectionCard>
  )
}
