import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaymentRequestLog } from "@/lib/types/payment-request.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPaymentRequestLogsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "payment_request.error.not_found":
      return "Không tìm thấy yêu cầu thanh toán."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lịch sử của yêu cầu thanh toán này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// No filters beyond pagination — GetPaymentRequestLogsReqDto is bare PageOptionsDto.
export const getPaymentRequestLogs = createServerFn({ method: "GET" })
  .validator(
    z.object({
      paymentRequestId: z.uuid(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
    })
  )
  .handler(async ({ data }): Promise<PaginatedResponse<PaymentRequestLog>> => {
    try {
      const { paymentRequestId, page, limit } = data
      const response = await http.get<PaginatedResponse<PaymentRequestLog>>(
        `/api/payment-requests/${paymentRequestId}/logs`,
        { params: { page, limit } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPaymentRequestLogs")

      throw new Error(resolveGetPaymentRequestLogsErrorMessage(error))
    }
  })
