import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OperationDetail } from "@/lib/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getOperation = createServerFn({ method: "GET" })
  .validator(z.object({ operationId: z.uuid() }))
  .handler(async ({ data }): Promise<OperationDetail> => {
    try {
      const response = await http.get<OperationDetail>(
        `/api/operations/${data.operationId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOperation")

      throw new Error(resolveGetOperationErrorMessage(error))
    }
  })
