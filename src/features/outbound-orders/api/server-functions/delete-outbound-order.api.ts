import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteOutboundOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "outbound_order.error.not_deletable":
      return "Phiếu không còn ở trạng thái Nháp — không thể xóa."
    case "auth.error.forbidden":
      return "Bạn không có quyền xóa phiếu giao hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Xóa hẳn — chỉ khi DRAFT (BUG-090). Dòng phiếu xóa theo qua cascade ở BE.
export const deleteOutboundOrder = createServerFn({ method: "POST" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/outbound-orders/${data.outboundOrderId}`)
    } catch (error) {
      logHttpError(error, "deleteOutboundOrder")

      throw new Error(resolveDeleteOutboundOrderErrorMessage(error))
    }
  })
