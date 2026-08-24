import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectOutboundOrderSchema } from "@/features/outbound-orders/schemas/reject-outbound-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.invalid_approval_state":
      return "Phiếu không còn ở trạng thái Chờ duyệt. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const rejectOutboundOrder = createServerFn({ method: "POST" })
  .validator(rejectOutboundOrderSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/outbound-orders/${data.outboundOrderId}/reject`, {
        reason: data.reason,
      })
    } catch (error) {
      logHttpError(error, "rejectOutboundOrder")

      throw new Error(resolveRejectOutboundOrderErrorMessage(error))
    }
  })
