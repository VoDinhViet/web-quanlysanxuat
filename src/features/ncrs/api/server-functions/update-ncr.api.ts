import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { updateNcrSchema } from "@/features/ncrs/schemas/update-ncr.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateNcrErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.not_found":
      return "Không tìm thấy NCR."
    case "ncr.error.invalid_status":
      return "NCR không còn ở trạng thái phù hợp. Vui lòng tải lại trang."
    case "ncr.error.quantity_exceeds_ng":
      return "SL sửa chữa + SL làm mới không được vượt SL hàng lỗi."
    case "department.error.not_found":
      return "Bộ phận đã chọn không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateNcr = createServerFn({ method: "POST" })
  .validator(updateNcrSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { ncrId, ...payload } = data
      await http.patch(`/api/ncrs/${ncrId}`, payload)
    } catch (error) {
      logHttpError(error, "updateNcr")

      throw new Error(resolveUpdateNcrErrorMessage(error))
    }
  })
