import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateOrderBuyerPoSchema } from "@/features/orders/schemas/update-order-buyer-po.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOrderBuyerPoErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "order.error.not_editable":
      return "Đơn hàng đã hoàn thành hoặc đã hủy nên không thể đổi số PO."
    case "order.error.locked_pending_confirmation":
      return "Đơn hàng đang chờ xác nhận nên không thể đổi số PO."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa số PO của đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Writes only `buyerPoNo`, so it also works on an approved order (the full edit form does not).
export const updateOrderBuyerPo = createServerFn({ method: "POST" })
  .validator(updateOrderBuyerPoSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { orderId, buyerPoNo } = data
      await http.patch(`/api/orders/${orderId}/buyer-po`, { buyerPoNo })
    } catch (error) {
      logHttpError(error, "updateOrderBuyerPo")

      throw new Error(resolveUpdateOrderBuyerPoErrorMessage(error))
    }
  })
