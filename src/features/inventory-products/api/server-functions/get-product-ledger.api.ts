import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductLedgerEntry } from "@/lib/types/product-ledger.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductLedgerErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `endDate` means "đến hết ngày này" — the backend's GetProductLedgerReqDto already gives it an
// exclusive-next-day boundary server-side, so a bare "yyyy-MM-dd" is sent as-is, same idiom as
// get-inventory-transactions.api.ts (be-quanlysanxuat's GetInventoryTransactionsReqDto) used.
const getProductLedgerSchema = z.object({
  itemId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  startDate: optional(z.string().trim()),
  endDate: optional(z.string().trim()),
})

export const getProductLedger = createServerFn({ method: "GET" })
  .validator(getProductLedgerSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<ProductLedgerEntry>> => {
      const { itemId, ...params } = data
      try {
        const response = await http.get<PaginatedResponse<ProductLedgerEntry>>(
          `/api/inventory-products/${itemId}/ledger`,
          { params }
        )

        return response.data
      } catch (error) {
        logHttpError(error, "getProductLedger")

        throw new Error(resolveGetProductLedgerErrorMessage(error))
      }
    }
  )
