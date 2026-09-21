import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "outsourcing_order.error.has_receipts":
      return "Phiếu đã có OS-IN liên kết chưa hủy — không thể hủy."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền hủy phiếu."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT|POSTED → CANCELLED — đảo bút toán nếu đã POSTED, chặn nếu còn OS-IN chưa hủy. Xem
// OutsourcingOrderDetailActions.tsx.
export const cancelOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/cancel`,
        {}
      )
    } catch (error) {
      logHttpError(error, "cancelOutsourcingOrder")

      throw new Error(resolveCancelOutsourcingOrderErrorMessage(error))
    }
  })
