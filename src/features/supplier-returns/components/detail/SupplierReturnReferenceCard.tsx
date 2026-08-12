import { Link2 } from "lucide-react"
import type { ReactNode } from "react"

import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { SupplierReturnCodeCell } from "@/features/supplier-returns/components/SupplierReturnsTableCells"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnReferenceCardProps = {
  detail: SupplierReturnDetail
}

// Mã IQC/Mã NK/PO — reuses SupplierReturnCodeCell as-is (yellow "--" when the return isn't
// linked to that document), same idiom as the list table and the now-retired detail sheet.
export function SupplierReturnReferenceCard({
  detail,
}: SupplierReturnReferenceCardProps) {
  return (
    <SupplierReturnDetailSectionCard icon={Link2} title="Mã tham chiếu">
      <dl className="divide-y divide-border">
        <ReferenceRow
          label="Mã IQC"
          value={<SupplierReturnCodeCell code={detail.iqcCode} />}
        />
        <ReferenceRow
          label="Mã nhập kho"
          value={
            <SupplierReturnCodeCell
              code={detail.inventoryReceipt?.code ?? null}
            />
          }
        />
        <ReferenceRow
          label="PO"
          value={
            <SupplierReturnCodeCell code={detail.purchaseOrder?.code ?? null} />
          }
        />
      </dl>
    </SupplierReturnDetailSectionCard>
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
      <dd>{value}</dd>
    </div>
  )
}
