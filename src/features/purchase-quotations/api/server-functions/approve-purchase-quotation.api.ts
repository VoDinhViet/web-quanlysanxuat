import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { approvePurchaseQuotationSchema } from "@/features/purchase-quotations/schemas/approve-purchase-quotation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveApprovePurchaseQuotationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "purchase_quotation.error.supplier_not_selected":
      return "Chưa chọn đủ NCC thắng thầu cho mọi vật tư. Vui lòng tải lại trang."
    case "purchase_quotation.error.invalid_status_transition":
      return "Báo giá đã đổi trạng thái. Vui lòng tải lại trang."
    case "auth.error.forbidden":
      return "Bạn không có quyền duyệt báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const approvePurchaseQuotation = createServerFn({ method: "POST" })
  .validator(approvePurchaseQuotationSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-quotations/${data.purchaseQuotationId}/approve`,
        { selectedSuppliers: data.selectedSuppliers }
      )
    } catch (error) {
      logHttpError(error, "approvePurchaseQuotation")

      throw new Error(resolveApprovePurchaseQuotationErrorMessage(error))
    }
  })
