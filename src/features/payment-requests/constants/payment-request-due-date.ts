import { differenceInCalendarDays, parseISO } from "date-fns"

import { vnZone } from "@/lib/time"
import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestStatus as PaymentRequestStatusType } from "@/lib/types/payment-request.type"

export type PaymentRequestDueDateTone = "overdue" | "near-due" | "normal"

// Days before dueDate at which the countdown turns amber — same threshold as
// orders' resolveDeliveryTone. Presentation-only.
const nearDueDays = 3

// Duplicated (not imported) from orders'/production-orders' due-date tone logic — a feature may
// only read another feature's data through its api/index.ts barrel, never its components/logic
// (see .claude/rules/architecture.md "Layer boundaries"). `today` is a parameter rather than
// new Date() called inside, so a server-rendered and a client-rendered pass agree — same
// SSR-safety idiom as resolveDeliveryTone (order.type.ts).
//
// Returns `null` once the request is PAID or CANCELLED — a countdown on a settled document is
// noise, not signal. DRAFT / REJECTED still count down: the buyer is the one who must act.
export function resolvePaymentRequestDueDateTone(
  dueDate: string,
  status: PaymentRequestStatusType,
  today: Date
): PaymentRequestDueDateTone | null {
  if (
    status === PaymentRequestStatus.PAID ||
    status === PaymentRequestStatus.CANCELLED
  ) {
    return null
  }

  const daysLeft = differenceInCalendarDays(
    parseISO(dueDate, { in: vnZone }),
    today
  )

  if (daysLeft < 0) {
    return "overdue"
  }

  return daysLeft <= nearDueDays ? "near-due" : "normal"
}

// Paired display string for the tone above — `null` mirrors resolvePaymentRequestDueDateTone's
// `null` (nothing to show once the request is PAID or CANCELLED).
export function formatPaymentRequestDueDateNote(
  dueDate: string,
  status: PaymentRequestStatusType,
  today: Date
): string | null {
  if (resolvePaymentRequestDueDateTone(dueDate, status, today) === null) {
    return null
  }

  const daysLeft = differenceInCalendarDays(
    parseISO(dueDate, { in: vnZone }),
    today
  )

  if (daysLeft < 0) {
    return `Quá hạn ${Math.abs(daysLeft)} ngày`
  }

  return daysLeft === 0 ? "Đến hạn hôm nay" : `Còn ${daysLeft} ngày`
}
