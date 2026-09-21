import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "order.error.not_deletable":
      return "Đơn hàng không còn ở trạng thái Nháp — không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá đơn hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Xoá mềm — chỉ khi DRAFT (order.error.not_deletable nếu khác).
export const deleteOrder = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/orders/${data.orderId}`)
    } catch (error) {
      logHttpError(error, "deleteOrder")

      throw new Error(resolveDeleteOrderErrorMessage(error))
    }
  })
