import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { ProductInventoryItem } from "@/lib/types/inventory-product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemInventoryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getItemInventorySchema = z.object({
  itemId: z.uuid(),
})

// `GET /api/inventory-products?itemId=&limit=1` — backend's GetInventoryProductsReqDto.itemId
// filter (be-quanlysanxuat's InventoryProductsService.getInventoryProducts). Unwraps the single
// row. Falls back to `null` when the list comes back empty so the page can render a "chưa có dữ
// liệu tồn kho" state instead of throwing, same non-blocking-degrade posture as the rest of this
// endpoint family.
export const getItemInventory = createServerFn({ method: "GET" })
  .validator(getItemInventorySchema)
  .handler(async ({ data }): Promise<ProductInventoryItem | null> => {
    try {
      const response = await http.get<PaginatedResponse<ProductInventoryItem>>(
        "/api/inventory-products",
        { params: { itemId: data.itemId, limit: 1 } }
      )

      return response.data.data[0] ?? null
    } catch (error) {
      logHttpError(error, "getItemInventory")

      throw new Error(resolveGetItemInventoryErrorMessage(error))
    }
  })
