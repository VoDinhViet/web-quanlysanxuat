import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutboundOrder } from "@/lib/types/outbound-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutboundOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOutboundOrders = createServerFn({ method: "GET" })
  .validator(outboundOrdersSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OutboundOrder>> => {
    try {
      const response = await http.get<PaginatedResponse<OutboundOrder>>(
        "/api/outbound-orders",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutboundOrders")

      throw new Error(resolveGetOutboundOrdersErrorMessage(error))
    }
  })
