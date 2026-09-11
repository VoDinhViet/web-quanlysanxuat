import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { deletePurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/delete-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeletePurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.invalid_status_transition":
      return "Chỉ có thể xoá báo giá khi ở trạng thái nháp."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deletePurchaseQuotation = createServerFn({ method: "POST" })
  .validator(deletePurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/purchase-quotations/${data.purchaseQuotationId}`)
    } catch (error) {
      logHttpError(error, "deletePurchaseQuotation")

      throw new Error(resolveDeletePurchaseQuotationErrorMessage(error))
    }
  })
