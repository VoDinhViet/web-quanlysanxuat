import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryIssueDetail } from "@/lib/types/inventory-issue.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryIssueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu xuất kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu xuất kho này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryIssue = createServerFn({ method: "GET" })
  .validator(z.object({ issueId: z.uuid() }))
  .handler(async ({ data }): Promise<InventoryIssueDetail> => {
    try {
      const response = await http.get<InventoryIssueDetail>(
        `/api/inventory-issues/${data.issueId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getInventoryIssue")

      throw new Error(resolveGetInventoryIssueErrorMessage(error))
    }
  })
