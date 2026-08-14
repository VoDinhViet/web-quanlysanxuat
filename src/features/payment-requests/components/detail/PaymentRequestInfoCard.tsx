import { FileText } from "lucide-react"
import { DateTime } from "luxon"

import { MockDataBadge } from "@/components/shared/MockDataBadge"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestInfoCardProps = {
  detail: PaymentRequestDetail
}

// Sidebar card — "Thông tin chứng từ".
// Same section/border idiom as PurchaseOrderSummaryCard.tsx.
export function PaymentRequestInfoCard({
  detail,
}: PaymentRequestInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3.5 font-heading text-base font-semibold tracking-tight text-foreground sm:px-5">
        <FileText className="size-4 text-muted-foreground" />
        Thông tin chứng từ
      </div>

      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-5">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Ngày tạo
          </p>
          <p className="text-sm font-medium text-foreground">
            {DateTime.fromISO(detail.createdAt).toFormat("dd/MM/yyyy HH:mm")}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Người tạo
          </p>
          <p className="text-sm font-medium text-foreground">
            {detail.createdBy ?? "—"}
          </p>
        </div>

        {detail.note && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Ghi chú
            </p>
            <p className="text-sm text-foreground">{detail.note}</p>
          </div>
        )}

        <div className="mt-1 flex items-center gap-1.5">
          <MockDataBadge className="h-4 px-1.5 text-[9px]" />
          <span className="text-[10px] text-muted-foreground">
            Dữ liệu mẫu — chờ kết nối API
          </span>
        </div>
      </div>
    </section>
  )
}
