import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingOrderItem } from "@/lib/types/outsourcing-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingOrderItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem chi tiết phiếu gia công ngoài này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutsourcingOrderItems = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<OutsourcingOrderItem[]> => {
    try {
      const response = await http.get<OutsourcingOrderItem[]>(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/items`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingOrderItems")

      throw new Error(resolveGetOutsourcingOrderItemsErrorMessage(error))
    }
  })
