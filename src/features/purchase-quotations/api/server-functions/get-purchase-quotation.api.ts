import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseQuotationDetail } from "@/lib/types/purchase-quotation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseQuotationErrorMessage(error: unknown): string {
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

export const getPurchaseQuotation = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseQuotationId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseQuotationDetail> => {
    try {
      const response = await http.get<PurchaseQuotationDetail>(
        `/api/purchase-quotations/${data.purchaseQuotationId}`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseQuotation")

      throw new Error(resolveGetPurchaseQuotationErrorMessage(error))
    }
  })
