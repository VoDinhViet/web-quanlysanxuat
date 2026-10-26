import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApproveOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PENDING_APPROVAL → APPROVED — xem OutsourcingOrderDetailActions.tsx.
export const approveOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/approve`,
        {}
      )
    } catch (error) {
      logHttpError(error, "approveOutsourcingOrder")

      throw new Error(resolveApproveOutsourcingOrderErrorMessage(error))
    }
  })
