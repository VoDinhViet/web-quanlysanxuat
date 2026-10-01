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
    case "purchase_request.error.not_editable":
      return "Không thể thay đổi trạng thái khi đề xuất ở trạng thái Nháp."
    case "purchase_ledger.error.line_not_purchasable":
      return "Dòng vật tư đã phát sinh đơn mua hàng, không thể đánh dấu không mua."
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
