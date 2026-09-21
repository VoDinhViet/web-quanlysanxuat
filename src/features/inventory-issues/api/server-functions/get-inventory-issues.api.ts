import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { inventoryIssuesSearchSchema } from "@/features/inventory-issues/schemas/inventory-issues-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryIssue } from "@/lib/types/inventory-issue.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryIssuesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu xuất kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryIssues = createServerFn({ method: "GET" })
  .validator(inventoryIssuesSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<InventoryIssue>> => {
    try {
      const response = await http.get<PaginatedResponse<InventoryIssue>>(
        "/api/inventory-issues",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getInventoryIssues")

      throw new Error(resolveGetInventoryIssuesErrorMessage(error))
    }
  })
