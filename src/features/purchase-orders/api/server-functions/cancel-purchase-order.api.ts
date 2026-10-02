import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { cancelPurchaseOrderSchema } from "@/features/purchase-orders/schemas/cancel-purchase-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCancelPurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.invalid_status_transition":
      return "Đơn mua hàng đã bị huỷ."
    case "purchase_order.error.has_posted_receipts":
      return "Đã có phiếu nhập kho ghi nhận cho đơn này, không thể huỷ."
    case "purchase_quotation.error.order_already_placed":
      return "Báo giá còn đơn mua khác đã đặt hàng. Hãy huỷ các đơn đó trước khi mở lại báo giá."
    case "payment_request.error.already_paid":
      return "Yêu cầu thanh toán của đơn mua hàng này đã thanh toán, không thể huỷ."
    case "auth.error.forbidden":
      return "Bạn không có quyền huỷ đơn mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT/ORDERED → CANCELLED — see PurchaseOrderCancelDialog.tsx.
export const cancelPurchaseOrder = createServerFn({ method: "POST" })
  .validator(cancelPurchaseOrderSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/purchase-orders/${data.purchaseOrderId}/cancel`, {
        reason: data.reason,
        reopenQuotation: data.reopenQuotation,
      })
    } catch (error) {
      logHttpError(error, "cancelPurchaseOrder")

      throw new Error(resolveCancelPurchaseOrderErrorMessage(error))
    }
  })
