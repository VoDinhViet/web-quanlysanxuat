import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectPurchaseRequestSchema } from "@/features/purchase-requests/schemas/reject-purchase-request.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectPurchaseRequestErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request.error.invalid_approval_state":
      return "Đề xuất không còn ở trạng thái Chờ duyệt. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối đề xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const rejectPurchaseRequest = createServerFn({ method: "POST" })
  .validator(rejectPurchaseRequestSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-requests/${data.purchaseRequestId}/reject`,
        { reason: data.reason }
      )
    } catch (error) {
      logHttpError(error, "rejectPurchaseRequest")

      throw new Error(resolveRejectPurchaseRequestErrorMessage(error))
    }
  })
