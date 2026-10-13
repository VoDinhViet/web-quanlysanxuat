import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { rejectNcrSchema } from "@/features/ncrs/schemas/reject-ncr.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectNcrErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const rejectNcr = createServerFn({ method: "POST" })
  .validator(rejectNcrSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/ncrs/${data.ncrId}/reject`, {
        reason: data.reason,
      })
    } catch (error) {
      logHttpError(error, "rejectNcr")

      throw new Error(resolveRejectNcrErrorMessage(error))
    }
  })
