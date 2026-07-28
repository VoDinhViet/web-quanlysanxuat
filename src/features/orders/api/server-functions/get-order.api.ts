import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderDetail } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đơn hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOrder = createServerFn({ method: "GET" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<OrderDetail> => {
    try {
      const response = await http.get<OrderDetail>(
        `/api/orders/${data.orderId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOrder")

      throw new Error(resolveGetOrderErrorMessage(error))
    }
  })
