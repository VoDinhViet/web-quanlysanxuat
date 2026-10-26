import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmSendOutsourcingOrderErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận xuất gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// APPROVED → SENT: hàng rời xưởng, từ đây mới nhập về được — xem OutsourcingOrderDetailActions.tsx.
export const confirmSendOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/confirm-send`,
        {}
      )
    } catch (error) {
      logHttpError(error, "confirmSendOutsourcingOrder")

      throw new Error(resolveConfirmSendOutsourcingOrderErrorMessage(error))
    }
  })
