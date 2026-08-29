import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { PurchaseQuotationStatusBadge } from "@/features/purchase-quotations/components/primitives/PurchaseQuotationBadges"
import { PurchaseQuotationDetailActions } from "@/features/purchase-quotations/components/layouts/PurchaseQuotationDetailActions"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailHeaderProps = {
  detail: PurchaseQuotationDetail
}

// Identity + info row, same single-block idiom as PurchaseRequestDetailHeader.tsx.
export function PurchaseQuotationDetailHeader({
  detail,
}: PurchaseQuotationDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách báo giá NCC"
            asChild
          >
            <Link
              to="/manage/purchase-quotations"
              search={{ page: 1, limit: 10 }}
            >
              <AltArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <PurchaseQuotationStatusBadge status={detail.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaField
            label="Người tạo"
            value={detail.creatorBy?.fullName ?? "—"}
          />
          <MetaField
            label="Ngày tạo"
            value={DateTime.fromISO(detail.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
          <MetaField label="Số vật tư" value={String(detail.items.length)} />
          <MetaField label="Ghi chú" value={detail.note ?? "—"} />
        </div>
      </div>

      <PurchaseQuotationDetailActions detail={detail} />
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
