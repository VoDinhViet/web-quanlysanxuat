import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { setOperationAssignmentsSchema } from "@/features/operations/schemas/set-operation-assignments.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSetOperationAssignmentsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn."
    case "operation.error.assignment_invalid":
      return "Có nhân sự không tồn tại hoặc đã nghỉ việc."
    case "auth.error.forbidden":
      return "Bạn không có quyền phân công nhân sự cho công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const setOperationAssignments = createServerFn({ method: "POST" })
  .validator(setOperationAssignmentsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.put(`/api/operations/${data.operationId}/assignments`, {
        userIds: data.userIds,
      })
    } catch (error) {
      logHttpError(error, "setOperationAssignments")

      throw new Error(resolveSetOperationAssignmentsErrorMessage(error))
    }
  })
