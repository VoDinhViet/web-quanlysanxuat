import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { cancelPurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/cancel-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelPurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.invalid_status_transition":
      return "Báo giá đã đổi trạng thái. Vui lòng tải lại trang."
    case "purchase_quotation.error.order_already_placed":
      return "Báo giá đã có đơn mua hàng được đặt. Hủy các đơn đó trước."
    case "auth.error.forbidden":
      return "Bạn không có quyền hủy báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const cancelPurchaseQuotation = createServerFn({ method: "POST" })
  .validator(cancelPurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-quotations/${data.purchaseQuotationId}/cancel`,
        { reason: data.reason }
      )
    } catch (error) {
      logHttpError(error, "cancelPurchaseQuotation")

      throw new Error(resolveCancelPurchaseQuotationErrorMessage(error))
    }
  })
