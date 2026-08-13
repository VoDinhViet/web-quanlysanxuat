import { Warehouse } from "lucide-react"
import { DateTime } from "luxon"

import { MockDataBadge } from "@/components/shared/MockDataBadge"
import type { InventoryReceiptDetail } from "@/lib/types/inventory-receipt.type"

type InventoryReceiptInfoCardProps = {
  detail: InventoryReceiptDetail
}

export function InventoryReceiptInfoCard({
  detail,
}: InventoryReceiptInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <Warehouse className="size-4 text-muted-foreground" />
        Thông tin kho & chứng từ
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Kho lưu trữ
          </p>
          <p className="text-sm font-medium text-foreground">
            {detail.warehouseName}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Người giao hàng
          </p>
          <p className="text-sm font-medium text-foreground">
            {detail.delivererName ?? "—"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Thời gian lập phiếu
          </p>
          <p className="text-sm font-medium text-foreground">
            {DateTime.fromISO(detail.receiptDate).toFormat(
              "dd/MM/yyyy HH:mm"
            )}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <MockDataBadge className="h-4 px-1.5 text-[9px]" />
          <span className="text-[10px] text-muted-foreground">
            Dữ liệu giả lập
          </span>
        </div>
      </div>
    </section>
  )
}
