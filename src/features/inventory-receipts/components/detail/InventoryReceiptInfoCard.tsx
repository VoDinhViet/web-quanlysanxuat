import { History } from "lucide-react"
import { DateTime } from "luxon"

import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptInfoCardProps = {
  detail: InventoryReceiptDetail
}

// Backend không có bảng lịch sử trạng thái riêng (`inventory_receipts` chỉ giữ
// createdBy/createdAt/postedBy/postedAt, không có cột huỷ) — card này gộp các mốc thời gian thật
// đang có thay vì dựng một timeline giả nhiều bước, xem docs/domains/inventory.md.
export function InventoryReceiptInfoCard({
  detail,
}: InventoryReceiptInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <History className="size-4 text-muted-foreground" />
        Nhật ký phiếu
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <InfoRow
          label="Tạo lúc"
          value={`${DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy HH:mm")}${detail.creatorBy ? ` · ${detail.creatorBy.fullName}` : ""}`}
        />

        {detail.postedAt && (
          <InfoRow
            label="Xác nhận nhập kho lúc"
            value={`${DateTime.fromISO(detail.postedAt).toFormat("dd/MM/yyyy HH:mm")}${detail.posterBy ? ` · ${detail.posterBy.fullName}` : ""}`}
          />
        )}

        <InfoRow
          label="Cập nhật lần cuối"
          value={DateTime.fromISO(detail.updatedAt).toFormat(
            "dd/MM/yyyy HH:mm"
          )}
        />
      </div>
    </section>
  )
}

type InfoRowProps = {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
