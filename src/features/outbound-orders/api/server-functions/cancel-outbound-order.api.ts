import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_cancellable":
      return "Phiếu không còn ở trạng thái có thể hủy (đã giao hoặc đã hủy). Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền hủy phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT/PENDING_APPROVAL/PENDING_DELIVERY → CANCELLED — giải phóng giữ chỗ thành phẩm (BUG-090),
// không đụng tồn kho thật (ba trạng thái này chưa deliver). Không có body, không idempotent.
export const cancelOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/outbound-orders/${data.outboundOrderId}/cancel`)
    } catch (error) {
      logHttpError(error, "cancelOutboundOrder")

      throw new Error(resolveCancelOutboundOrderErrorMessage(error))
    }
  })
