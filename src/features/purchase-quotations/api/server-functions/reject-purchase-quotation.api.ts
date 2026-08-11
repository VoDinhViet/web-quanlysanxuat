import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { rejectPurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/reject-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRejectPurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.invalid_status_transition":
      return "Báo giá đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền từ chối báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const rejectPurchaseQuotation = createServerFn({ method: "POST" })
  .validator(rejectPurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-quotations/${data.purchaseQuotationId}/reject`,
        { reason: data.reason }
      )
    } catch (error) {
      logHttpError(error, "rejectPurchaseQuotation")

      throw new Error(resolveRejectPurchaseQuotationErrorMessage(error))
    }
  })
