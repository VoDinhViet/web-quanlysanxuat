import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveIssueInventoryRequisitionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "inventory_requisition.error.not_issuable":
      return "Phiếu chưa được duyệt nên chưa thể xuất kho."
    case "inventory_issue.error.iqc_pending":
      return "Còn vật tư chưa hoàn tất kiểm tra chất lượng (IQC), chưa thể xuất kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất kho phiếu lãnh vật tư này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const issueInventoryRequisition = createServerFn({ method: "POST" })
  .validator(z.object({ requisitionId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/inventory-requisitions/${data.requisitionId}/issue`)
    } catch (error) {
      logHttpError(error, "issueInventoryRequisition")

      throw new Error(resolveIssueInventoryRequisitionErrorMessage(error))
    }
  })
