import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSendOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_sendable":
      return "Phiếu không còn ở trạng thái Nháp/Bị từ chối. Vui lòng tải lại trang."
    case "outbound_order.error.oqc_not_completed":
      return "Còn lệnh sản xuất chưa qua hết kiểm tra chất lượng (OQC). Không thể gửi duyệt."
    case "outbound_order.error.quantity_exceeds_deliverable":
      return "Có dòng vượt số lượng có thể giao — kiểm tra lại tồn kho hoặc lệnh xuất khác đang giữ hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT/REJECTED → PENDING_APPROVAL — gate OQC E205 (không chỉ tin approve sẽ bắt lỗi), chưa trừ
// tồn kho. Không có body, không idempotent (gọi lại khi đã gửi trả outbound_order.error.not_sendable).
export const sendOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/outbound-orders/${data.outboundOrderId}/send`)
    } catch (error) {
      logHttpError(error, "sendOutboundOrder")

      throw new Error(resolveSendOutboundOrderErrorMessage(error))
    }
  })
