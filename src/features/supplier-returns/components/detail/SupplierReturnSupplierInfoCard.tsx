import { useSuspenseQuery } from "@tanstack/react-query"
import { Building2, MapPin, Phone, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { SupplierReturnDetailSectionCard } from "@/features/supplier-returns/components/detail/SupplierReturnDetailSectionCard"
import { supplierQueryOptions } from "@/features/suppliers/api"

type SupplierReturnSupplierInfoCardProps = {
  supplierId: string
}

// Name/address/contact/phone all come from GET /api/suppliers/:id — the phiếu trả response
// only carries a {id, code, name} ref, not the full supplier the mockup shows. The route loader
// already prefetched this, so it resolves synchronously off cache (see
// $supplierReturnId.tsx's sequential-await loader).
export function SupplierReturnSupplierInfoCard({
  supplierId,
}: SupplierReturnSupplierInfoCardProps) {
  const { data: supplier } = useSuspenseQuery(supplierQueryOptions(supplierId))

  const primaryRepresentative =
    supplier.representatives.find((rep) => rep.isPrimary) ??
    supplier.representatives.at(0)

  return (
    <SupplierReturnDetailSectionCard icon={Building2} title="Nhà cung cấp">
      <dl className="space-y-4">
        <ContactRow icon={Building2} label="Tên NCC" value={supplier.name} />
        <ContactRow icon={MapPin} label="Địa chỉ" value={supplier.address} />
        <ContactRow
          icon={User}
          label="Người liên hệ"
          value={primaryRepresentative?.name ?? "—"}
        />
        <ContactRow
          icon={Phone}
          label="Điện thoại"
          value={supplier.phoneNumber}
        />
      </dl>
    </SupplierReturnDetailSectionCard>
  )
}

type ContactRowProps = {
  icon: LucideIcon
  label: string
  value: ReactNode
}

function ContactRow({ icon: Icon, label, value }: ContactRowProps) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 space-y-0.5">
        <dt className="text-[11px] font-medium text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm font-medium break-words text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}
