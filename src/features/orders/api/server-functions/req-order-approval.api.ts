import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { OrderStatus } from "@/lib/types/order.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveReqOrderApprovalErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "order.error.not_editable":
      return "Đơn hàng đã hoàn thành hoặc đã hủy nên không thể gửi duyệt."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Đơn hàng ở DRAFT → PENDING_CONFIRMATION — a plain PATCH with only `status` (see
// UpdateOrderReqDto), same permission (orders:update) as any other edit.
export const reqOrderApproval = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/orders/${data.orderId}`, {
        status: OrderStatus.PENDING_CONFIRMATION,
      })
    } catch (error) {
      logHttpError(error, "reqOrderApproval")

      throw new Error(resolveReqOrderApprovalErrorMessage(error))
    }
  })
