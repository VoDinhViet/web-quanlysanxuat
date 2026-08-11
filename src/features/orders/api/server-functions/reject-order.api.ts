import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectOrderSchema } from "@/features/orders/schemas/reject-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderDetail } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "order.error.invalid_approval_state":
      return "Đơn hàng không còn ở trạng thái Chờ xác nhận. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING_CONFIRMATION → REJECTED, with a mandatory reason — director-level `orders:approve`,
// same permission as approveOrder.
export const rejectOrder = createServerFn({ method: "POST" })
  .validator(rejectOrderSchema)
  .handler(async ({ data }): Promise<OrderDetail> => {
    try {
      const { orderId, reason } = data
      const response = await http.post<OrderDetail>(
        `/api/orders/${orderId}/reject`,
        { reason }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "rejectOrder")

      throw new Error(resolveRejectOrderErrorMessage(error))
    }
  })
