import { Warehouse } from "lucide-react"

import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnWarehouseSectionProps = {
  detail: SupplierReturnDetail
}

// "Kho xuất trả" is real (the return's own `warehouse` field); ngày xuất trả/người xuất/ghi chú
// xuất trả/đính kèm all need a xuất-trả-kho workflow the backend doesn't have yet — no
// `issuedBy`/`issuedAt` column, no attachment table for this domain (see the plan's backend
// audit). Flagged rather than left off the page, so it's visible what the mockup still needs.
export function SupplierReturnWarehouseSection({
  detail,
}: SupplierReturnWarehouseSectionProps) {
  return (
    <SupplierReturnDetailSectionCard
      icon={Warehouse}
      title="Thông tin xuất trả (kho)"
    >
      <div className="mb-4 space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Kho xuất trả
        </p>
        <p className="text-sm font-medium text-foreground">
          {detail.warehouse.name}
        </p>
      </div>

      <MissingSectionAlert>
        Chưa có API cho ngày xuất trả / người xuất / ghi chú xuất trả / đính kèm
        file — các trường này sẽ hiển thị khi backend hỗ trợ nghiệp vụ xuất trả
        kho.
      </MissingSectionAlert>
    </SupplierReturnDetailSectionCard>
  )
}
