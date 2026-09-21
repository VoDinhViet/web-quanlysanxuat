import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createPositionSchema } from "@/features/departments/schemas/create-position.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreatePositionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "position.error.code_exists":
      return "Mã chức vụ đã tồn tại."
    case "department.error.not_found":
      return "Không tìm thấy phòng ban."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo chức vụ."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createPosition = createServerFn({ method: "POST" })
  .validator(createPositionSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/positions", data)
    } catch (error) {
      logHttpError(error, "createPosition")

      throw new Error(resolveCreatePositionErrorMessage(error))
    }
  })
