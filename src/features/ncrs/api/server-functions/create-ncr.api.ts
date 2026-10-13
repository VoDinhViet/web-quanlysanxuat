import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { createNcrSchema } from "@/features/ncrs/schemas/create-ncr.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateNcrErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "ncr.error.client_required":
      return "NCR khách hàng cần chọn khách hàng."
    case "ncr.error.department_required":
      return "Vui lòng chọn bộ phận phát sinh NCR."
    case "item.error.not_found":
      return "Sản phẩm không tồn tại."
    case "department.error.not_found":
      return "Bộ phận đã chọn không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo NCR."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createNcr = createServerFn({ method: "POST" })
  .validator(createNcrSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/ncrs", data)
    } catch (error) {
      logHttpError(error, "createNcr")

      throw new Error(resolveCreateNcrErrorMessage(error))
    }
  })
