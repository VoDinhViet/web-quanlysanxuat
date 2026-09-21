import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseChainNotes } from "@/lib/types/purchase-chain-notes.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryReceiptRelatedNotesErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem phiếu nhập kho này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryReceiptRelatedNotes = createServerFn({
  method: "GET",
})
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseChainNotes> => {
    try {
      const response = await http.get<PurchaseChainNotes>(
        `/api/inventory-receipts/${data.receiptId}/related-notes`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getInventoryReceiptRelatedNotes")

      throw new Error(
        resolveGetInventoryReceiptRelatedNotesErrorMessage(error)
      )
    }
  })
