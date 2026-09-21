import { TriangleAlert } from "lucide-react"

import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestStatusNoticeProps = {
  paymentRequest: PaymentRequestDetail
}

// Viết riêng trong feature — không dùng shared StatusNotice, vì tông destructive của nó không
// hợp với success. Chỉ CANCELLED mới cần dải thông báo (có lý do đi kèm); PAID không hiện gì —
// badge trạng thái trên header đã đủ nói lên chuyện đó. `null` khi còn PENDING hoặc PAID.
export function PaymentRequestStatusNotice({
  paymentRequest,
}: PaymentRequestStatusNoticeProps) {
  if (
    paymentRequest.status === PaymentRequestStatus.CANCELLED &&
    paymentRequest.cancellationReason
  ) {
    return (
      <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-destructive">
            Yêu cầu thanh toán đã bị hủy
          </p>
          <p className="text-sm text-foreground">
            {paymentRequest.cancellationReason}
          </p>
        </div>
      </div>
    )
  }

  return null
}
