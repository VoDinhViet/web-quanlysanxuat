import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeliverOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_deliverable":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "inventory_document.error.insufficient_stock":
      return "Tồn kho thành phẩm không đủ để xuất giao."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING_DELIVERY → DELIVERED — tự sinh + post 1 phiếu xuất kho SALES đúng các dòng của DO (trừ
// tồn kho thành phẩm thật), rồi đóng đơn hàng nếu đã giao đủ (be-quanlysanxuat/docs/decisions/
// production-lifecycle-closing.md). Không có body, không idempotent (gọi lại khi đã giao trả
// outbound_order.error.not_deliverable).
export const deliverOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outbound-orders/${data.outboundOrderId}/deliver`,
        {}
      )
    } catch (error) {
      logHttpError(error, "deliverOutboundOrder")

      throw new Error(resolveDeliverOutboundOrderErrorMessage(error))
    }
  })
