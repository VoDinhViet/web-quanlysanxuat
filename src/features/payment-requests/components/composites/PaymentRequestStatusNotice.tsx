import { TriangleAlert } from "lucide-react"

import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

type PaymentRequestStatusNoticeProps = {
  paymentRequest: PaymentRequestDetail
}

// Viết riêng trong feature — không dùng shared StatusNotice, vì tông destructive của nó không
// hợp với success. Chỉ CANCELLED và REJECTED mới cần dải thông báo (có lý do đi kèm); PAID không
// hiện gì — badge trạng thái trên header đã đủ nói lên chuyện đó. Lý do từ chối chỉ hiện khi còn
// REJECTED; sau khi đề nghị lại (PENDING) dải này biến mất. `null` ở các trạng thái còn lại.
export function PaymentRequestStatusNotice({
  paymentRequest,
}: PaymentRequestStatusNoticeProps) {
  if (
    paymentRequest.status === PaymentRequestStatus.CANCELLED &&
    paymentRequest.cancellationReason
  ) {
    return (
      <NoticeBanner
        title="Yêu cầu thanh toán đã bị hủy"
        reason={paymentRequest.cancellationReason}
      />
    )
  }

  if (
    paymentRequest.status === PaymentRequestStatus.REJECTED &&
    paymentRequest.rejectionReason
  ) {
    return (
      <NoticeBanner
        title="Yêu cầu thanh toán bị từ chối"
        reason={paymentRequest.rejectionReason}
        hint="Người mua hàng sửa lại thông tin rồi đề nghị thanh toán lại."
      />
    )
  }

  return null
}

type NoticeBannerProps = {
  title: string
  reason: string
  hint?: string
}

function NoticeBanner({ title, reason, hint }: NoticeBannerProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="text-sm text-foreground">{reason}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  )
}
