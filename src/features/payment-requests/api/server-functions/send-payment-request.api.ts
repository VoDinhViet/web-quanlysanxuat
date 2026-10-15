import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSendPaymentRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Yêu cầu thanh toán đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền đề nghị thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT / REJECTED → PENDING — see SendPaymentRequestDialog.tsx.
export const sendPaymentRequest = createServerFn({ method: "POST" })
  .validator(z.object({ paymentRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/payment-requests/${data.paymentRequestId}/send`, {})
    } catch (error) {
      logHttpError(error, "sendPaymentRequest")

      throw new Error(resolveSendPaymentRequestErrorMessage(error))
    }
  })
