import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectPaymentRequestSchema } from "@/features/payment-requests/schemas/reject-payment-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectPaymentRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING → REJECTED, reason required — see PaymentRequestRejectDialog.tsx.
export const rejectPaymentRequest = createServerFn({ method: "POST" })
  .validator(rejectPaymentRequestSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/payment-requests/${data.paymentRequestId}/reject`, {
        reason: data.reason,
      })
    } catch (error) {
      logHttpError(error, "rejectPaymentRequest")

      throw new Error(resolveRejectPaymentRequestErrorMessage(error))
    }
  })
