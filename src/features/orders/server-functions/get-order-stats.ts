import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderStats } from "@/features/orders/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOrderStatsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem thống kê đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// A real aggregate endpoint, like /api/suppliers/stats. The "N parallel limit=1
// count queries" trick other slices used cannot work here: three of the six
// tiles are sums of money, and `pagination.totalRecords` is a COUNT.
export const getOrderStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<OrderStats> => {
    try {
      const response = await http.get<OrderStats>("/api/orders/stats")

      return response.data
    } catch (error) {
      logHttpError(error, "getOrderStats")

      throw new Error(resolveGetOrderStatsErrorMessage(error))
    }
  }
)
