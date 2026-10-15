import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePaymentRequestUrgencyErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "payment_request.error.invalid_status_transition":
      return "Chỉ đổi được mức độ khi yêu cầu thanh toán đang chờ thanh toán."
    case "auth.error.forbidden":
      return "Bạn không có quyền đổi mức độ yêu cầu thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Đánh dấu YCTT gấp / bình thường (PH-133); chỉ đổi được khi còn chờ thanh toán.
export const updatePaymentRequestUrgency = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      isUrgent: z.boolean(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/payment-requests/${data.paymentRequestId}/urgency`,
        { isUrgent: data.isUrgent }
      )
    } catch (error) {
      logHttpError(error, "updatePaymentRequestUrgency")

      throw new Error(resolveUpdatePaymentRequestUrgencyErrorMessage(error))
    }
  })
