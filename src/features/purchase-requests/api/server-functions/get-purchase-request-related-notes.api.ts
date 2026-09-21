import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseChainNotes } from "@/lib/types/purchase-chain-notes.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseRequestRelatedNotesErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đề xuất mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseRequestRelatedNotes = createServerFn({
  method: "GET",
})
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseChainNotes> => {
    try {
      const response = await http.get<PurchaseChainNotes>(
        `/api/purchase-requests/${data.purchaseRequestId}/related-notes`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseRequestRelatedNotes")

      throw new Error(resolveGetPurchaseRequestRelatedNotesErrorMessage(error))
    }
  })
