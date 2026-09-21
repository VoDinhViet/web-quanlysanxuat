import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeletePurchaseRequestItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "purchase_request_item.error.not_found":
      return "Không tìm thấy dòng vật tư này."
    case "purchase_request.error.not_editable":
      return "Chỉ có thể xóa khi đề xuất đang ở trạng thái Nháp."
    case "purchase_request_item.error.last_item":
      return "Đề xuất phải còn ít nhất 1 dòng vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deletePurchaseRequestItem = createServerFn({ method: "POST" })
  .validator(
    z.object({
      purchaseRequestId: z.uuid(),
      purchaseRequestItemId: z.uuid(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(
        `/api/purchase-requests/${data.purchaseRequestId}/items/${data.purchaseRequestItemId}`
      )
    } catch (error) {
      logHttpError(error, "deletePurchaseRequestItem")

      throw new Error(resolveDeletePurchaseRequestItemErrorMessage(error))
    }
  })
