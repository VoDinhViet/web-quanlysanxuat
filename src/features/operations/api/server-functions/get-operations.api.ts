import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { operationsSearchSchema } from "@/features/operations/schemas/operations-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { OperationDetail } from "@/lib/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Full-detail, paginated variant for the management screen (list/create/update/delete) — distinct
// from get-operation-options.api.ts, the silent-fail combobox picker over `GET /api/operations/options`
// returning the narrower `OperationRef` shape for BOM/routing steps.
export const getOperations = createServerFn({ method: "GET" })
  .validator(operationsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OperationDetail>> => {
    try {
      const response = await http.get<PaginatedResponse<OperationDetail>>(
        "/api/operations",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOperations")

      throw new Error(resolveGetOperationsErrorMessage(error))
    }
  })
