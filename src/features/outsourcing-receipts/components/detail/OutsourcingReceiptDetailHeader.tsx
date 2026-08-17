import { Link } from "@tanstack/react-router"
import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { OutsourcingReceiptDetailActions } from "@/features/outsourcing-receipts/components/detail/OutsourcingReceiptDetailActions"
import { OutsourcingReceiptStatusBadge } from "@/features/outsourcing-receipts/components/OutsourcingReceiptBadges"
import type { OutsourcingReceiptDetail } from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptDetailHeaderProps = {
  detail: OutsourcingReceiptDetail
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Identity row + at-a-glance meta grid + header-level actions — same shell as
// SupplierReturnDetailHeader.tsx. "Số dòng"/"Tổng SL nhận" thay cho "Vật tư nhận"/"SL nhận" cũ (1
// phiếu giờ có thể nhiều dòng — chi tiết từng dòng xem OutsourcingReceiptItemsCard.tsx).
export function OutsourcingReceiptDetailHeader({
  detail,
}: OutsourcingReceiptDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách phiếu nhận gia công ngoài"
            asChild
          >
            <Link
              to="/manage/outsourcing-receipts"
              search={{ page: 1, limit: 10 }}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>
          </Button>

          <span className="font-mono text-lg font-bold text-foreground">
            {detail.code}
          </span>
          <OutsourcingReceiptStatusBadge status={detail.progress} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          <MetaField label="Số dòng" value={String(detail.items.length)} />
          <MetaField
            label="Tổng SL nhận"
            value={quantityFormatter.format(detail.totalQuantity)}
          />
          <MetaField label="Kho nhận" value={detail.warehouse.name} />
          <MetaField
            label="Ngày nhận"
            value={DateTime.fromISO(detail.receiptDate).toFormat("dd/MM/yyyy")}
          />
        </div>
      </div>

      <OutsourcingReceiptDetailActions detail={detail} />
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
