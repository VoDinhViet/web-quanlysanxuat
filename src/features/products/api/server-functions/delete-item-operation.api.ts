import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteItemOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "routing_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteItemOperation = createServerFn({ method: "POST" })
  .validator(
    z.object({
      itemId: z.uuid(),
      stepId: z.uuid(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/items/${data.itemId}/operations/${data.stepId}`)
    } catch (error) {
      logHttpError(error, "deleteItemOperation")

      throw new Error(resolveDeleteItemOperationErrorMessage(error))
    }
  })
