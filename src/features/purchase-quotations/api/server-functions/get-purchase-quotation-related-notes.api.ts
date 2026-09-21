import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseChainNotes } from "@/lib/types/purchase-chain-notes.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseQuotationRelatedNotesErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseQuotationRelatedNotes = createServerFn({
  method: "GET",
})
  .validator(z.object({ purchaseQuotationId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseChainNotes> => {
    try {
      const response = await http.get<PurchaseChainNotes>(
        `/api/purchase-quotations/${data.purchaseQuotationId}/related-notes`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseQuotationRelatedNotes")

      throw new Error(
        resolveGetPurchaseQuotationRelatedNotesErrorMessage(error)
      )
    }
  })
