import { DateTime } from "luxon"
import { ArrowLeft } from "lucide-react"
import type { ReactNode } from "react"

import { LinkButton } from "@/components/ui/button"
import { OutsourcingReceiptDetailActions } from "@/features/outsourcing-receipts/components/layouts/OutsourcingReceiptDetailActions"
import { OutsourcingReceiptDocStatusBadge } from "@/features/outsourcing-receipts/components/primitives/OutsourcingReceiptBadges"
import type {
  OutsourcingReceiptDetail,
  OutsourcingReceiptItem,
} from "@/lib/types/outsourcing-receipt.type"

type OutsourcingReceiptDetailHeaderProps = {
  receipt: OutsourcingReceiptDetail
  items: OutsourcingReceiptItem[]
}

const quantityFormatter = new Intl.NumberFormat("vi-VN")

// Identity row + at-a-glance meta grid + header-level actions — same shell as
// SupplierReturnDetailHeader.tsx. "Số dòng"/"Tổng SL nhận" thay cho "Vật tư nhận"/"SL nhận" cũ (1
// phiếu giờ có thể nhiều dòng — chi tiết từng dòng xem OutsourcingReceiptItemsCard.tsx). Header
// (GET /:id) không còn trả `items`/`totalQuantity`/`progress` — "Số dòng"/"Tổng SL nhận" tự tính
// từ `items` (GET /:id/items, fetch riêng ở Page), badge chuyển sang raw doc status, cùng khuôn
// OutsourcingOrderDetailHeader.tsx bên OS-OUT.
export function OutsourcingReceiptDetailHeader({
  receipt,
  items,
}: OutsourcingReceiptDetailHeaderProps) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5 print:hidden">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            to="/manage/outsourcing-receipts"
            search={{ page: 1, limit: 10 }}
            variant="ghost"
            className="-ml-1.5 gap-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Quay lại danh sách phiếu nhận gia công ngoài"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </LinkButton>

          <span className="font-mono text-lg font-bold text-foreground">
            {receipt.code}
          </span>
          <OutsourcingReceiptDocStatusBadge status={receipt.status} />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <MetaField label="Số dòng" value={String(items.length)} />
          <MetaField
            label="Tổng SL nhận"
            value={quantityFormatter.format(totalQuantity)}
          />
          <MetaField
            label="Ngày nhận"
            value={DateTime.fromISO(receipt.receiptDate).toFormat("dd/MM/yyyy")}
          />
        </div>
      </div>

      <OutsourcingReceiptDetailActions receipt={receipt} />
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
