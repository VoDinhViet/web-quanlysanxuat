import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_confirmable":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "outbound_order.error.oqc_not_completed":
      return "Còn lệnh sản xuất chưa qua hết kiểm tra chất lượng (OQC). Không thể xác nhận giao."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận phiếu giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT → PENDING_DELIVERY — gate OQC E205, chưa trừ tồn kho (bước trừ tồn thật là
// deliver-outbound-order.api.ts, PENDING_DELIVERY → DELIVERED). Không có body, không idempotent
// (gọi lại khi đã confirm trả outbound_order.error.not_confirmable).
export const confirmOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outbound-orders/${data.outboundOrderId}/confirm`,
        {}
      )
    } catch (error) {
      logHttpError(error, "confirmOutboundOrder")

      throw new Error(resolveConfirmOutboundOrderErrorMessage(error))
    }
  })
