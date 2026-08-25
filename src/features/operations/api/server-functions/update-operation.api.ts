import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateOperationSchema } from "@/features/operations/schemas/update-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "operation.error.code_exists":
      return "Mã công đoạn đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateOperation = createServerFn({ method: "POST" })
  .validator(updateOperationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { operationId, ...payload } = data
      await http.patch(`/api/operations/${operationId}`, payload)
    } catch (error) {
      logHttpError(error, "updateOperation")

      throw new Error(resolveUpdateOperationErrorMessage(error))
    }
  })
