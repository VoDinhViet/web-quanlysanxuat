import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteOutsourcingOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu gia công ngoài."
    case "inventory_document.error.invalid_status_transition":
      return "Chỉ có thể xoá phiếu còn ở trạng thái Nháp."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá phiếu."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Chỉ xoá được khi còn DRAFT — dòng con xoá theo cascade. Xem OutsourcingOrderDetailActions.tsx.
export const deleteOutsourcingOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/outsourcing-orders/${data.outsourcingOrderId}`)
    } catch (error) {
      logHttpError(error, "deleteOutsourcingOrder")

      throw new Error(resolveDeleteOutsourcingOrderErrorMessage(error))
    }
  })
