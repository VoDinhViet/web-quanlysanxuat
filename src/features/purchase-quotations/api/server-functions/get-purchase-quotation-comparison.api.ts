import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PurchaseQuotationItemDetail } from "@/lib/types/purchase-quotation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPurchaseQuotationComparisonErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_quotation.error.not_found":
      return "Không tìm thấy báo giá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem bảng so sánh báo giá này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPurchaseQuotationComparison = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseQuotationId: z.uuid() }))
  .handler(async ({ data }): Promise<PurchaseQuotationItemDetail[]> => {
    try {
      const response = await http.get<PurchaseQuotationItemDetail[]>(
        `/api/purchase-quotations/${data.purchaseQuotationId}/comparison`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseQuotationComparison")

      throw new Error(resolveGetPurchaseQuotationComparisonErrorMessage(error))
    }
  })
