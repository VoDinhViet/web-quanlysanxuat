import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOperationAssignmentIdsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem nhân sự công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Every assigned user id, unpaginated — the current selection the bulk-assign dialog starts from,
// and what a single removal replaces (PUT sends the whole list).
export const getOperationAssignmentIds = createServerFn({ method: "GET" })
  .validator(z.object({ operationId: z.uuid() }))
  .handler(async ({ data }): Promise<string[]> => {
    try {
      const response = await http.get<string[]>(
        `/api/operations/${data.operationId}/assignments/ids`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOperationAssignmentIds")

      throw new Error(resolveGetOperationAssignmentIdsErrorMessage(error))
    }
  })
