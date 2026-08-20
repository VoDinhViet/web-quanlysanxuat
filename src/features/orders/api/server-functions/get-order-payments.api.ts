import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderPayment } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOrderPaymentsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lịch sử thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOrderPayments = createServerFn({ method: "GET" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<OrderPayment[]> => {
    try {
      const response = await http.get<OrderPayment[]>(
        `/api/orders/${data.orderId}/payments`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOrderPayments")

      throw new Error(resolveGetOrderPaymentsErrorMessage(error))
    }
  })
