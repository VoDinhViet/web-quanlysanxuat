import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { requestNcrOqcSchema } from "@/features/ncrs/schemas/request-ncr-oqc.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRequestNcrOqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "ncr.error.job_required":
      return "NCR không gắn Job nên không yêu cầu OQC lại được."
    case "ncr.error.no_processing_quantity":
      return "Hướng xử lý này có SL bằng 0 nên không thực hiện được."
    case "ncr.error.oqc_quantity_exceeds":
      return "SL kiểm lại vượt SL sửa chữa + làm mới của NCR."
    case "auth.error.forbidden":
      return "Bạn không có quyền yêu cầu OQC cho NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const requestNcrOqc = createServerFn({ method: "POST" })
  .validator(requestNcrOqcSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { ncrId, ...payload } = data
      await http.post(`/api/ncrs/${ncrId}/oqc`, payload)
    } catch (error) {
      logHttpError(error, "requestNcrOqc")

      throw new Error(resolveRequestNcrOqcErrorMessage(error))
    }
  })
