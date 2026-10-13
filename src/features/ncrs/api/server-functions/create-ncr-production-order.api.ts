import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"
import { NcrProductionAction } from "@/lib/types/ncr.type"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateNcrProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "ncr.error.order_required":
      return "NCR chưa gắn đơn hàng (SO) nên không tạo được LSX."
    case "ncr.error.production_order_exists":
      return "NCR đã có LSX cho hướng xử lý này."
    case "ncr.error.no_processing_quantity":
      return "Hướng xử lý này có SL bằng 0 nên không thực hiện được."
    case "ncr.error.rework_operations_required":
      return "Vui lòng chọn công đoạn cần sửa chữa trước khi gửi duyệt."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo LSX từ NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createNcrProductionOrder = createServerFn({ method: "POST" })
  .validator(z.object({ ncrId: z.uuid(), action: z.enum(NcrProductionAction) }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/ncrs/${data.ncrId}/production-order`, {
        action: data.action,
      })
    } catch (error) {
      logHttpError(error, "createNcrProductionOrder")

      throw new Error(resolveCreateNcrProductionOrderErrorMessage(error))
    }
  })
