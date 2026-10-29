import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { endOfDay, isValid, parseISO } from "date-fns"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { vnZone } from "@/lib/time"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductInventoryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `asOfDate` means "tồn tại thời điểm 23:59 ngày này" (see GetInventoryProductsReqDto's own doc
// comment on the backend), but the backend's `lte(transactionDate, asOfDate)` doesn't add
// that end-of-day offset itself — unlike getInventoryTransactions's `endDate`, which does. A bare
// "yyyy-MM-dd" would parse as UTC midnight and drop same-(Vietnam-)day transactions, so the
// end-of-day instant has to be built here, in Asia/Ho_Chi_Minh, before it goes on the wire.
function toEndOfDayUtcIso(value: string): string {
  const endOfVnDay = endOfDay(parseISO(value, { in: vnZone }))

  if (!isValid(endOfVnDay)) {
    throw new Error("Invalid asOfDate")
  }

  return new Date(endOfVnDay).toISOString()
}

const getProductInventorySchema = z
  .object({
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).optional(),
    q: optional(z.string().trim()),
    asOfDate: z.string().trim().min(1).optional(),
  })
  .transform(({ asOfDate, ...rest }) => ({
    ...rest,
    asOfDate: asOfDate ? toEndOfDayUtcIso(asOfDate) : undefined,
  }))

export const getProductInventory = createServerFn({ method: "GET" })
  .validator(getProductInventorySchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<ProductInventoryItem>> => {
      try {
        // `/api/inventory-products` chỉ trả FG (be-quanlysanxuat's InventoryProductsService) —
        // không còn cần tự gửi `itemType` như route `/api/inventory` cũ.
        const response = await http.get<
          PaginatedResponse<ProductInventoryItem>
        >("/api/inventory-products", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getProductInventory")

        throw new Error(resolveGetProductInventoryErrorMessage(error))
      }
    }
  )
