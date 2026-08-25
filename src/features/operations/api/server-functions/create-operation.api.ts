import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createOperationSchema } from "@/features/operations/schemas/create-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.code_exists":
      return "Mã công đoạn đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createOperation = createServerFn({ method: "POST" })
  .validator(createOperationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/operations", data)
    } catch (error) {
      logHttpError(error, "createOperation")

      throw new Error(resolveCreateOperationErrorMessage(error))
    }
  })
