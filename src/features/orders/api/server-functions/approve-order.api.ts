import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OrderDetail } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveOrderErrorMessage(error: unknown): string {
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

// PENDING_CONFIRMATION → AWAITING_PRODUCTION, the only path to that status — director-level
// `orders:approve`, distinct from `orders:update` on every other write.
export const approveOrder = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<OrderDetail> => {
    try {
      const response = await http.post<OrderDetail>(
        `/api/orders/${data.orderId}/approve`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "approveOrder")

      throw new Error(resolveApproveOrderErrorMessage(error))
    }
  })
