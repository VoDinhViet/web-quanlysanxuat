import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PageOutsourcingOrderResDto (GET /outsourcing-orders, danh sách) khớp thẳng OutsourcingOrder.
// `status` gửi thẳng BE (POSTED/CANCELLED).
export const getOutsourcingOrders = createServerFn({ method: "GET" })
  .validator(outsourcingOrdersSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OutsourcingOrder>> => {
    try {
      const response = await http.get<PaginatedResponse<OutsourcingOrder>>(
        "/api/outsourcing-orders",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingOrders")

      throw new Error(resolveGetOutsourcingOrdersErrorMessage(error))
    }
  })
