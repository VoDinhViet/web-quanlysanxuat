import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolvePostInventoryIssueErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu xuất kho."
    case "inventory_document.error.invalid_status_transition":
      return "Phiếu không ở trạng thái phù hợp để xuất kho."
    case "inventory_document.error.insufficient_stock":
      return "Tồn kho không đủ để xuất."
    case "inventory_issue.error.iqc_pending":
      return "Còn vật tư chưa hoàn tất kiểm tra chất lượng (IQC), chưa thể xuất kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất kho phiếu này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const postInventoryIssue = createServerFn({ method: "POST" })
  .validator(z.object({ issueId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-issues/${data.issueId}/post`)
    } catch (error) {
      logHttpError(error, "postInventoryIssue")

      throw new Error(resolvePostInventoryIssueErrorMessage(error))
    }
  })
