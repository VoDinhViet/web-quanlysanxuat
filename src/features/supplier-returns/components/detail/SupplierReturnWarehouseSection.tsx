import { DateTime } from "luxon"
import { PackageCheck } from "lucide-react"
import type { ReactNode } from "react"

import { MissingSectionAlert } from "@/components/shared/MissingSectionAlert"
import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { InventoryDocumentStatus } from "@/lib/types/supplier-return.type"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnWarehouseSectionProps = {
  detail: SupplierReturnDetail
}

// "Kho xuất trả" now lives in the header's meta grid. This card is about the export event
// itself: `posterBy`/`postedAt` are real once `status` reaches POSTED (see
// supplier-return.type.ts) and were previously fetched but never rendered anywhere — showing
// them here replaces what used to be a near-empty card (1 field + a full-width warning) with
// real content once a return has actually been exported. Ghi chú xuất trả/đính kèm file still
// have no backing column/table (no xuất-trả-kho workflow yet), so those stay flagged.
export function SupplierReturnWarehouseSection({
  detail,
}: SupplierReturnWarehouseSectionProps) {
  const isPosted = detail.status === InventoryDocumentStatus.POSTED

  return (
    <SupplierReturnDetailSectionCard
      icon={PackageCheck}
      title="Xác nhận xuất trả"
      description={isPosted ? "Đã xuất trả kho" : "Chờ kho xác nhận xuất trả"}
    >
      <div className="space-y-4">
        {isPosted && detail.postedAt ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField
              label="Người xuất trả"
              value={detail.posterBy?.fullName ?? "—"}
            />
            <InfoField
              label="Ngày xuất trả"
              value={DateTime.fromISO(detail.postedAt).toFormat(
                "dd/MM/yyyy HH:mm"
              )}
            />
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Phiếu chưa được xác nhận xuất — người xuất trả và ngày xuất trả sẽ
            hiển thị ở đây sau khi kho xác nhận.
          </p>
        )}

        <MissingSectionAlert>
          Chưa có API cho ghi chú xuất trả / đính kèm file — các trường này sẽ
          hiển thị khi backend hỗ trợ nghiệp vụ xuất trả kho.
        </MissingSectionAlert>
      </div>
    </SupplierReturnDetailSectionCard>
  )
}

type InfoFieldProps = {
  label: string
  value: ReactNode
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words text-foreground">
        {value}
      </dd>
    </div>
  )
}
