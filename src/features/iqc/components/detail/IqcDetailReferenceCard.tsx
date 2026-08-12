import { LinkCircle } from "@solar-icons/react"
import { DateTime } from "luxon"
import type { ReactNode } from "react"

import { IqcDetailSectionCard } from "@/features/iqc/components/detail/IqcDetailSectionCard"
import { IqcPoOrReasonCell } from "@/features/iqc/components/IqcTableCells"
import type { IqcDetail } from "@/lib/types/iqc.type"

type IqcDetailReferenceCardProps = {
  detail: IqcDetail
}

// NCC, PO/Lý do (reuses IqcPoOrReasonCell from the list table as-is), người tạo, ngày tạo — same
// dl/dt/dd row idiom as SupplierReturnReferenceCard.tsx.
export function IqcDetailReferenceCard({
  detail,
}: IqcDetailReferenceCardProps) {
  return (
    <IqcDetailSectionCard icon={LinkCircle} title="Tham chiếu">
      <dl className="divide-y divide-border">
        <ReferenceRow label="Nhà cung cấp" value={detail.supplier.name} />
        <ReferenceRow
          label="PO / Lý do"
          value={
            <IqcPoOrReasonCell
              purchaseOrder={detail.purchaseOrder}
              reason={detail.reason}
            />
          }
        />
        <ReferenceRow
          label="Người tạo"
          value={detail.creatorBy?.fullName ?? "—"}
        />
        <ReferenceRow
          label="Ngày tạo"
          value={DateTime.fromISO(detail.createdAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
      </dl>
    </IqcDetailSectionCard>
  )
}

type ReferenceRowProps = {
  label: string
  value: ReactNode
}

function ReferenceRow({ label, value }: ReferenceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-xs font-medium text-foreground">{value}</dd>
    </div>
  )
}
