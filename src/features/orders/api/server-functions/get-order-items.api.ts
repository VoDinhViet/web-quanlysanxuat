import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderItem } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOrderItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách sản phẩm của đơn hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOrderItems = createServerFn({ method: "GET" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<OrderItem[]> => {
    try {
      const response = await http.get<OrderItem[]>(
        `/api/orders/${data.orderId}/items`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOrderItems")

      throw new Error(resolveGetOrderItemsErrorMessage(error))
    }
  })
