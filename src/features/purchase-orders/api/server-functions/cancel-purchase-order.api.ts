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
      })
    } catch (error) {
      logHttpError(error, "cancelPurchaseOrder")

      throw new Error(resolveCancelPurchaseOrderErrorMessage(error))
    }
  })
