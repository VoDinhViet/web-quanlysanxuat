import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { closePurchaseOrderSchema } from "@/features/purchase-orders/schemas/close-purchase-order.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveClosePurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.invalid_status_transition":
      return "Đơn mua hàng đã đổi trạng thái hoặc đã được đóng. Vui lòng tải lại trang."
    case "purchase_order.error.has_unposted_receipts":
      return "Còn phiếu nhập kho chưa ghi sổ. Hãy ghi sổ hoặc huỷ các phiếu đó trước khi đóng sớm."
    case "purchase_order.error.nothing_to_close":
      return "Đơn chưa nhận hàng hoặc đã nhận đủ — không có gì để đóng sớm."
    case "auth.error.forbidden":
      return "Bạn không có quyền đóng sớm đơn mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// ORDERED (partially received) → closed early — see PurchaseOrderCloseDialog.tsx.
export const closePurchaseOrder = createServerFn({ method: "POST" })
  .validator(closePurchaseOrderSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/purchase-orders/${data.purchaseOrderId}/close`, {
        reason: data.reason,
      })
    } catch (error) {
      logHttpError(error, "closePurchaseOrder")

      throw new Error(resolveClosePurchaseOrderErrorMessage(error))
    }
  })
