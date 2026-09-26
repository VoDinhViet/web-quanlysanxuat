import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { UserListItem } from "@/lib/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOperationAssignmentsErrorMessage(error: unknown): string {
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

export const getOperationAssignmentsSchema = z.object({
  operationId: z.uuid(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  q: z.string().optional(),
  departmentId: z.uuid().optional(),
  positionId: z.uuid().optional(),
})

export const getOperationAssignments = createServerFn({ method: "GET" })
  .validator(getOperationAssignmentsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<UserListItem>> => {
    try {
      const { operationId, ...params } = data
      const response = await http.get<PaginatedResponse<UserListItem>>(
        `/api/operations/${operationId}/assignments`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOperationAssignments")

      throw new Error(resolveGetOperationAssignmentsErrorMessage(error))
    }
  })
