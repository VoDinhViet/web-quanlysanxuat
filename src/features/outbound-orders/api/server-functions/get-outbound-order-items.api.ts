import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutboundOrderItem } from "@/lib/types/outbound-order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutboundOrderItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem chi tiết phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutboundOrderItems = createServerFn({ method: "GET" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<OutboundOrderItem[]> => {
    try {
      const response = await http.get<OutboundOrderItem[]>(
        `/api/outbound-orders/${data.outboundOrderId}/items`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutboundOrderItems")

      throw new Error(resolveGetOutboundOrderItemsErrorMessage(error))
    }
  })
