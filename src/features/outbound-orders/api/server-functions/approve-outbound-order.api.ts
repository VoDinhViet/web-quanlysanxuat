import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.invalid_approval_state":
      return "Phiếu không còn ở trạng thái Chờ duyệt. Vui lòng tải lại trang."
    case "outbound_order.error.oqc_not_completed":
      return "Còn lệnh sản xuất chưa qua hết kiểm tra chất lượng (OQC). Không thể duyệt."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const approveOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/outbound-orders/${data.outboundOrderId}/approve`)
    } catch (error) {
      logHttpError(error, "approveOutboundOrder")

      throw new Error(resolveApproveOutboundOrderErrorMessage(error))
    }
  })
