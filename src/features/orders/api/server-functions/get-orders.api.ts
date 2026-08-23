import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { ordersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Order, OrderStatus } from "@/lib/types/order.type"
import type { PaginatedResponse, SortOrder } from "@/lib/types/pagination.type"

type OrdersQueryParams = {
  page: number
  limit: number
  q?: string
  status?: OrderStatus
  assignedUserId?: string
  startDate?: string
  endDate?: string
  order?: SortOrder
}

// Empty `q` has to drop out entirely — the backend 422s on a present-but-empty `q` (see
// get-client-options.ts). `orderDateFrom`/`orderDateTo` rename to `startDate`/`endDate` here —
// GetOrdersReqDto's field names, which filter on `dueDate`, not `orderDate` (the URL param
// names stay as-is so existing shared links keep working; only the wire shape changes).
const getOrdersParamsSchema = ordersSearchSchema.transform(
  ({ q, orderDateFrom, orderDateTo, ...rest }): OrdersQueryParams => ({
    ...rest,
    q: q || undefined,
    startDate: orderDateFrom,
    endDate: orderDateTo,
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.invalid_date_range":
      return "Khoảng ngày đặt hàng không hợp lệ."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOrders = createServerFn({ method: "GET" })
  .validator(getOrdersParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Order>> => {
    try {
      // `data` is already wire-shaped — no mapping step left in the handler.
      const response = await http.get<PaginatedResponse<Order>>("/api/orders", {
        params: data,
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getOrders")

      throw new Error(resolveGetOrdersErrorMessage(error))
    }
  })
