import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { recallPurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/recall-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveRecallPurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.invalid_status_transition":
      return "Báo giá đã đổi trạng thái. Vui lòng tải lại trang."
    case "purchase_quotation.error.order_already_placed":
      return "Đã có đơn mua từ báo giá này được đặt hàng, không thể thu hồi."
    case "auth.error.forbidden":
      return "Bạn không có quyền thu hồi báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const recallPurchaseQuotation = createServerFn({ method: "POST" })
  .validator(recallPurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-quotations/${data.purchaseQuotationId}/recall`
      )
    } catch (error) {
      logHttpError(error, "recallPurchaseQuotation")

      throw new Error(resolveRecallPurchaseQuotationErrorMessage(error))
    }
  })
