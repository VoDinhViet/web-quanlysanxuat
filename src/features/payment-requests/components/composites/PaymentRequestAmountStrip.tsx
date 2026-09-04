import { DateTime } from "luxon"

import {
  formatPaymentRequestDueDateNote,
  resolvePaymentRequestDueDateTone,
} from "@/features/payment-requests/logic/payment-request-due-date"
import { vndFormatter } from "@/lib/currency"
import { cn } from "@/lib/utils"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"
import type { PaymentRequestDueDateTone } from "@/features/payment-requests/logic/payment-request-due-date"

type PaymentRequestAmountStripProps = {
  paymentRequest: PaymentRequestDetail
}

const dueDateToneClassName: Record<PaymentRequestDueDateTone, string> = {
  overdue: "text-destructive",
  "near-due": "text-amber-600 dark:text-amber-400",
  normal: "text-muted-foreground",
}

// The one place on the page allowed to be loud — the amount this document exists to get
// approved, at a size that appears nowhere else on the page, next to a due-date countdown coded
// with the same status palette the rest of the page already uses. See "Chỗ duy nhất được phép
// 'to tiếng'" in the design plan this mirrors.
export function PaymentRequestAmountStrip({
  paymentRequest,
}: PaymentRequestAmountStripProps) {
  const today = DateTime.now()
  const tone = resolvePaymentRequestDueDateTone(
    paymentRequest.dueDate,
    paymentRequest.status,
    today
  )
  const dueDateNote = formatPaymentRequestDueDateNote(
    paymentRequest.dueDate,
    paymentRequest.status,
    today
  )

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Số tiền đề nghị chi
        </p>
        <p className="font-heading text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {vndFormatter.format(paymentRequest.requestValue)} ₫
        </p>
      </div>

      <div className="space-y-1 text-right">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Hạn thanh toán
        </p>
        <p className="text-sm font-medium text-foreground">
          {DateTime.fromISO(paymentRequest.dueDate).toFormat("dd/MM/yyyy")}
        </p>
        {dueDateNote && tone ? (
          <p
            className={cn("text-xs font-semibold", dueDateToneClassName[tone])}
          >
            {dueDateNote}
          </p>
        ) : null}
      </div>
    </div>
  )
}
