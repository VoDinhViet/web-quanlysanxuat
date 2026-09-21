import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseChainNotes } from "@/lib/types/purchase-chain-notes.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseOrderRelatedNotesErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem đơn mua hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseOrderRelatedNotes = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseChainNotes> => {
    try {
      const response = await http.get<PurchaseChainNotes>(
        `/api/purchase-orders/${data.purchaseOrderId}/related-notes`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseOrderRelatedNotes")

      throw new Error(resolveGetPurchaseOrderRelatedNotesErrorMessage(error))
    }
  })
