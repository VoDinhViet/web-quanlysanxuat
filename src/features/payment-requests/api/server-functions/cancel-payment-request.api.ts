import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { cancelPaymentRequestSchema } from "@/features/payment-requests/schemas/cancel-payment-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelPaymentRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền hủy yêu cầu thanh toán này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING → CANCELLED, reason required — see PaymentRequestCancelDialog.tsx.
export const cancelPaymentRequest = createServerFn({ method: "POST" })
  .validator(cancelPaymentRequestSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/payment-requests/${data.paymentRequestId}/cancel`, {
        reason: data.reason,
      })
    } catch (error) {
      logHttpError(error, "cancelPaymentRequest")

      throw new Error(resolveCancelPaymentRequestErrorMessage(error))
    }
  })
