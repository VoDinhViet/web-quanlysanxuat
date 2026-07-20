import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { ordersSearchSchema } from "@/features/orders/schemas/orders-search.schema"
import { OVERDUE_FILTER_VALUE } from "@/features/orders/types/order.type"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type {
  Order,
  OrderStatus,
  PaymentTerm,
} from "@/features/orders/types/order.type"
import type { PaginatedResponse, SortOrder } from "@/lib/types/pagination.type"

type OrdersQueryParams = {
  page: number
  limit: number
  q?: string
  status?: OrderStatus
  overdue?: true
  paymentTerm?: PaymentTerm
  salesRepId?: string
  orderDateFrom?: string
  orderDateTo?: string
  order?: SortOrder
}

// "Trễ hạn" is one entry in the status select, but on the wire it is a separate
// `overdue` flag rather than a `status` value. Empty `q` has to drop out
// entirely too — the backend 422s on a present-but-empty `q` (see
// get-client-options.ts).
//
// This transform hangs off a derived schema, NOT off `ordersSearchSchema`
// itself: the route's validateSearch needs the raw shape so `useSearch()`
// returns `status: "OVERDUE"` for the filter select to show the right option.
const getOrdersParamsSchema = ordersSearchSchema.transform(
  ({ status, q, ...rest }): OrdersQueryParams =>
    status === OVERDUE_FILTER_VALUE
      ? { ...rest, q: q || undefined, overdue: true }
      : { ...rest, q: q || undefined, status }
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
