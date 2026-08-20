import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelInventoryIssueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu xuất kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu đã được xuất kho trước đó hoặc đã bị hủy."
    case "auth.error.forbidden":
      return "Bạn không có quyền hủy phiếu này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const cancelInventoryIssue = createServerFn({ method: "POST" })
  .validator(z.object({ issueId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-issues/${data.issueId}/cancel`)
    } catch (error) {
      logHttpError(error, "cancelInventoryIssue")

      throw new Error(resolveCancelInventoryIssueErrorMessage(error))
    }
  })
