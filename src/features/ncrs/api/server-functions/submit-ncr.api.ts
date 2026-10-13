import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSubmitNcrErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "ncr.error.department_required":
      return "Vui lòng chọn bộ phận phát sinh NCR."
    case "ncr.error.analysis_required":
      return "Vui lòng nhập nguyên nhân và biện pháp khắc phục trước khi gửi duyệt."
    case "ncr.error.rework_operations_required":
      return "Vui lòng chọn công đoạn cần sửa chữa trước khi gửi duyệt."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const submitNcr = createServerFn({ method: "POST" })
  .validator(z.object({ ncrId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/ncrs/${data.ncrId}/submit`)
    } catch (error) {
      logHttpError(error, "submitNcr")

      throw new Error(resolveSubmitNcrErrorMessage(error))
    }
  })
