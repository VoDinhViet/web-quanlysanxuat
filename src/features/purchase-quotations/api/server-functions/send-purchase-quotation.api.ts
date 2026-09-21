import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { sendPurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/send-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveSendPurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.no_items":
      return "Báo giá chưa có vật tư nào."
    case "purchase_quotation.error.item_without_supplier":
      return "Có vật tư chưa chọn NCC."
    case "purchase_quotation.error.missing_unit_price":
      return "Có báo giá chưa nhập đơn giá."
    case "purchase_quotation.error.invalid_status_transition":
      return "Báo giá đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền gửi duyệt báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const sendPurchaseQuotation = createServerFn({ method: "POST" })
  .validator(sendPurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-quotations/${data.purchaseQuotationId}/send`
      )
    } catch (error) {
      logHttpError(error, "sendPurchaseQuotation")

      throw new Error(resolveSendPurchaseQuotationErrorMessage(error))
    }
  })
