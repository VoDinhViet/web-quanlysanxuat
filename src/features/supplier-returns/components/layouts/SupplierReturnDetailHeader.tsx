import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { SupplierReturnDetailActions } from "@/features/supplier-returns/components/layouts/SupplierReturnDetailActions"
import { SupplierReturnStatusBadge } from "@/features/supplier-returns/components/primitives/SupplierReturnBadges"
import type { SupplierReturnDetail } from "@/lib/types/supplier-return.type"

type SupplierReturnDetailHeaderProps = {
  supplierReturn: SupplierReturnDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Identity row + at-a-glance meta grid + header-level actions (SupplierReturnDetailActions) —
// same shell as PurchaseOrderDetailHeader.tsx, which embeds PurchaseOrderDetailActions the same
// way instead of a separate sticky footer.
export function SupplierReturnDetailHeader({
  supplierReturn,
}: SupplierReturnDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách trả NCC"
            asChild
          >
            <Link to="/manage/supplier-returns" search={{ page: 1, limit: 10 }}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {supplierReturn.code}
          </span>
          <SupplierReturnStatusBadge status={supplierReturn.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <MetaField
            label="Vật tư trả"
            value={
              <span>
                <span className="font-mono text-primary">
                  {supplierReturn.item.code}
                </span>{" "}
                · {supplierReturn.item.name}
              </span>
            }
          />
          <MetaField
            label="SL trả"
            value={`${quantityFormatter.format(supplierReturn.quantity)} ${supplierReturn.item.unit.name}`}
          />
          <MetaField
            label="Ngày tạo phiếu"
            value={DateTime.fromISO(supplierReturn.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
        </div>
      </div>

      <SupplierReturnDetailActions supplierReturn={supplierReturn} />
    </div>
  )
}

type MetaFieldProps = {
  label: string
  value: ReactNode
}

function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
