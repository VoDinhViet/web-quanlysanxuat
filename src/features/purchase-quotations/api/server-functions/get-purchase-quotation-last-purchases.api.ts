import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { PurchaseQuotationLastPurchase } from "@/lib/types/purchase-quotation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

export const getPurchaseQuotationLastPurchases = createServerFn({
  method: "GET",
})
  .validator(z.object({ itemIds: z.array(z.uuid()).min(1) }))
  .handler(async ({ data }): Promise<PurchaseQuotationLastPurchase[]> => {
    try {
      const response = await http.get<PurchaseQuotationLastPurchase[]>(
        "/api/purchase-quotations/last-purchases",
        { params: { itemIds: data.itemIds.join(",") } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPurchaseQuotationLastPurchases")

      throw new Error(GENERIC_ERROR_MESSAGE)
    }
  })
