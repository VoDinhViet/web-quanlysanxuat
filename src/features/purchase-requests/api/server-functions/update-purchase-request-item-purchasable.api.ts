import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdatePurchasableErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request_item.error.not_found":
      return "Không tìm thấy dòng vật tư này."
    case "purchase_request.error.not_approved":
      return "Chỉ đánh dấu mua / không mua được sau khi đề xuất đã được duyệt."
    case "purchase_ledger.error.line_not_purchasable":
      return "Dòng vật tư đang nằm trong đơn mua hàng chưa huỷ hoặc chưa đóng, không thể đánh dấu không mua."
    case "purchase_request_item.error.in_active_quotation":
      return "Dòng vật tư đang nằm trong báo giá nháp hoặc chờ duyệt. Hãy huỷ hoặc sửa báo giá trước khi đánh dấu không mua."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updatePurchaseRequestItemPurchasable = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      purchaseRequestId: z.uuid(),
      purchaseRequestItemId: z.uuid(),
      requiresPurchase: z.boolean(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(
        `/api/purchase-requests/${data.purchaseRequestId}/items/${data.purchaseRequestItemId}/purchasable`,
        { requiresPurchase: data.requiresPurchase }
      )
    } catch (error) {
      logHttpError(error, "updatePurchaseRequestItemPurchasable")

      throw new Error(resolveUpdatePurchasableErrorMessage(error))
    }
  })
