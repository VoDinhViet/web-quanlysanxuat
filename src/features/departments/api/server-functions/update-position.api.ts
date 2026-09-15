import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updatePositionSchema } from "@/features/departments/schemas/update-position.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePositionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "position.error.not_found":
      return "Không tìm thấy chức vụ."
    case "position.error.code_exists":
      return "Mã chức vụ đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa chức vụ."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePosition = createServerFn({ method: "POST" })
  .validator(updatePositionSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { positionId, ...payload } = data
      await http.patch(`/api/positions/${positionId}`, payload)
    } catch (error) {
      logHttpError(error, "updatePosition")

      throw new Error(resolveUpdatePositionErrorMessage(error))
    }
  })
