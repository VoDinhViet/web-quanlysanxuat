import { useSuspenseQuery } from "@tanstack/react-query"
import { Building2 } from "lucide-react"
import type { ReactNode } from "react"

import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { supplierQueryOptions } from "@/features/suppliers/api"

type SupplierReturnSupplierInfoCardProps = {
  supplierId: string
}

// Name/address/contact/phone all come from GET /api/suppliers/:id — the phiếu trả response
// only carries a {id, code, name} ref, not the full supplier the mockup shows. The route loader
// already prefetched this, so it resolves synchronously off cache (see
// $supplierReturnId.tsx's sequential-await loader). 2-column label/value grid instead of a
// vertical icon-row stack — fills the card's half-width slot instead of leaving it half-empty.
export function SupplierReturnSupplierInfoCard({
  supplierId,
}: SupplierReturnSupplierInfoCardProps) {
  const { data: supplier } = useSuspenseQuery(supplierQueryOptions(supplierId))

  const primaryRepresentative =
    supplier.representatives.find((rep) => rep.isPrimary) ??
    supplier.representatives.at(0)

  return (
    <SupplierReturnDetailSectionCard
      icon={Building2}
      title="Nhà cung cấp"
      description={`Mã NCC: ${supplier.code}`}
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <InfoField label="Tên NCC" value={supplier.name} />
        <InfoField
          label="Người liên hệ"
          value={primaryRepresentative?.name ?? "—"}
        />
        <InfoField label="Địa chỉ" value={supplier.address} />
        <InfoField label="Điện thoại" value={supplier.phoneNumber} />
      </dl>
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
