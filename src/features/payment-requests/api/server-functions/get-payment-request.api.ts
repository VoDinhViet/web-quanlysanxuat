import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaymentRequestDetail } from "@/lib/types/payment-request.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPaymentRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem yêu cầu thanh toán này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPaymentRequest = createServerFn({ method: "GET" })
  .validator(z.object({ paymentRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<PaymentRequestDetail> => {
    try {
      const response = await http.get<PaymentRequestDetail>(
        `/api/payment-requests/${data.paymentRequestId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPaymentRequest")

      throw new Error(resolveGetPaymentRequestErrorMessage(error))
    }
  })
