import { DateTime } from "luxon"
import { AltArrowLeft } from "@solar-icons/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { PurchaseQuotationStatusBadge } from "@/features/purchase-quotations/components/primitives/PurchaseQuotationBadges"
import { purchaseQuotationComparisonQueryOptions } from "@/features/purchase-quotations/api/options"
import { PurchaseQuotationDetailActions } from "@/features/purchase-quotations/components/layouts/PurchaseQuotationDetailActions"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

type PurchaseQuotationDetailHeaderProps = {
  purchaseQuotation: PurchaseQuotationDetail
}

// Identity + info row, same single-block idiom as PurchaseRequestDetailHeader.tsx.
export function PurchaseQuotationDetailHeader({
  purchaseQuotation,
}: PurchaseQuotationDetailHeaderProps) {
  const { data: comparisonItems = [] } = useSuspenseQuery(
    purchaseQuotationComparisonQueryOptions(purchaseQuotation.id)
  )
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/purchase-quotations"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            aria-label="Quay lại danh sách báo giá NCC"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <AltArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {purchaseQuotation.code}
          </span>
          <PurchaseQuotationStatusBadge status={purchaseQuotation.status} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaField
            label="Người tạo"
            value={purchaseQuotation.creatorBy?.fullName ?? "—"}
          />
          <MetaField
            label="Ngày tạo"
            value={DateTime.fromISO(purchaseQuotation.createdAt).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          />
          <MetaField
            label="Số vật tư"
            value={String(purchaseQuotation.items?.length ?? comparisonItems.length)}
          />
          <MetaField label="Ghi chú" value={purchaseQuotation.note ?? "—"} />
        </div>
      </div>

      <PurchaseQuotationDetailActions purchaseQuotation={purchaseQuotation} />
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
