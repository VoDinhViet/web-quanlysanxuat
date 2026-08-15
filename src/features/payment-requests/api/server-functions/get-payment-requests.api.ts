import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { paymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaymentRequest } from "@/lib/types/payment-request.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPaymentRequestsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách yêu cầu thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPaymentRequests = createServerFn({ method: "GET" })
  .validator(paymentRequestsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<PaymentRequest>> => {
    try {
      const response = await http.get<PaginatedResponse<PaymentRequest>>(
        "/api/payment-requests",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPaymentRequests")

      throw new Error(resolveGetPaymentRequestsErrorMessage(error))
    }
  })
