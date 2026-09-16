import { DateTime } from "luxon"

import { PaymentRequestStatus } from "@/lib/types/payment-request.type"
import type { PaymentRequestStatus as PaymentRequestStatusType } from "@/lib/types/payment-request.type"

export type PaymentRequestDueDateTone = "overdue" | "near-due" | "normal"

// Days before dueDate at which the countdown turns amber — same threshold as
// orders' resolveDeliveryTone. Presentation-only.
const nearDueDays = 3

// Duplicated (not imported) from orders'/production-orders' due-date tone logic — a feature may
// only read another feature's data through its api/index.ts barrel, never its components/logic
// (see .claude/rules/architecture.md "Layer boundaries"). `today` is a parameter rather than
// DateTime.now() called inside, so a server-rendered and a client-rendered pass agree — same
// SSR-safety idiom as resolveDeliveryTone (order.type.ts).
//
// Returns `null` once the request has left PENDING — a countdown on an already-paid or
// already-cancelled document is noise, not signal.
export function resolvePaymentRequestDueDateTone(
  dueDate: string,
  status: PaymentRequestStatusType,
  today: DateTime
): PaymentRequestDueDateTone | null {
  if (status !== PaymentRequestStatus.PENDING) {
    return null
  }

  const daysLeft = DateTime.fromISO(dueDate)
    .startOf("day")
    .diff(today.startOf("day"), "days").days

  if (daysLeft < 0) {
    return "overdue"
  }

  return daysLeft <= nearDueDays ? "near-due" : "normal"
}

// Paired display string for the tone above — `null` mirrors resolvePaymentRequestDueDateTone's
// `null` (nothing to show once the request isn't PENDING anymore).
export function formatPaymentRequestDueDateNote(
  dueDate: string,
  status: PaymentRequestStatusType,
  today: DateTime
): string | null {
  if (resolvePaymentRequestDueDateTone(dueDate, status, today) === null) {
    return null
  }

  const daysLeft = Math.ceil(
    DateTime.fromISO(dueDate).startOf("day").diff(today.startOf("day"), "days")
      .days
  )

  if (daysLeft < 0) {
    return `Quá hạn ${Math.abs(daysLeft)} ngày`
  }

  return daysLeft === 0 ? "Đến hạn hôm nay" : `Còn ${daysLeft} ngày`
}
