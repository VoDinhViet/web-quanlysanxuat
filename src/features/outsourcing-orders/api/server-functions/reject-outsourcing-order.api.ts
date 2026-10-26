import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectOutsourcingOrderSchema } from "@/features/outsourcing-orders/schemas/reject-outsourcing-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING_APPROVAL → REJECTED, reason required — see RejectOutsourcingOrderDialog.tsx.
export const rejectOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(rejectOutsourcingOrderSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/reject`,
        { reason: data.reason }
      )
    } catch (error) {
      logHttpError(error, "rejectOutsourcingOrder")

      throw new Error(resolveRejectOutsourcingOrderErrorMessage(error))
    }
  })
