import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSubmitOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "outsourcing_order.error.planned_quantity_exceeded":
      return "Số lượng gửi vượt định mức còn lại của công đoạn. Vui lòng sửa phiếu."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT|REJECTED → PENDING_APPROVAL — xem OutsourcingOrderDetailActions.tsx.
export const submitOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/submit`,
        {}
      )
    } catch (error) {
      logHttpError(error, "submitOutsourcingOrder")

      throw new Error(resolveSubmitOutsourcingOrderErrorMessage(error))
    }
  })
