import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveConfirmPurchaseOrderErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "purchase_order.error.invalid_status_transition":
      return "Đơn mua hàng đã đổi trạng thái. Vui lòng tải lại trang."
    case "purchase_order.error.missing_expected_date":
      return "Chưa có ngày giao dự kiến."
    case "purchase_order.error.missing_unit_price":
      return "Có dòng vật tư chưa nhập đơn giá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xác nhận đặt hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// DRAFT → ORDERED — see PurchaseOrderConfirmDialog.tsx, which pre-checks the same 2 conditions
// (expectedDate set, every item has unitPrice) client-side for a smoother flow; the backend
// still re-validates.
export const confirmPurchaseOrder = createServerFn({ method: "POST" })
  .validator(z.object({ purchaseOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(
        `/api/purchase-orders/${data.purchaseOrderId}/confirm`,
        {}
      )
    } catch (error) {
      logHttpError(error, "confirmPurchaseOrder")

      throw new Error(resolveConfirmPurchaseOrderErrorMessage(error))
    }
  })
