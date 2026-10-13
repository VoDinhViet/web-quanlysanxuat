import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSkipNcrProductionOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "ncr.error.no_processing_quantity":
      return "Hướng xử lý này có SL bằng 0 nên không thực hiện được."
    case "auth.error.forbidden":
      return "Bạn không có quyền xử lý NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const skipNcrProductionOrder = createServerFn({ method: "POST" })
  .validator(z.object({ ncrId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/ncrs/${data.ncrId}/skip-production-order`)
    } catch (error) {
      logHttpError(error, "skipNcrProductionOrder")

      throw new Error(resolveSkipNcrProductionOrderErrorMessage(error))
    }
  })
