import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "operation.error.in_use":
      return "Công đoạn đang được dùng trong quy trình/BOM, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteOperation = createServerFn({ method: "POST" })
  .validator(z.object({ operationId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/operations/${data.operationId}`)
    } catch (error) {
      logHttpError(error, "deleteOperation")

      throw new Error(resolveDeleteOperationErrorMessage(error))
    }
  })
