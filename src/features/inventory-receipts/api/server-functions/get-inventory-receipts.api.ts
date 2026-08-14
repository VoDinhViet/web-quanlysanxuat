import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { inventoryReceiptsSearchSchema } from "@/features/inventory-receipts/schemas/inventory-receipts-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryReceipt } from "@/lib/types/inventory-receipt.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryReceiptsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu nhập kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryReceipts = createServerFn({ method: "GET" })
  .validator(inventoryReceiptsSearchSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<InventoryReceipt>> => {
    try {
      const response = await http.get<PaginatedResponse<InventoryReceipt>>(
        "/api/inventory-receipts",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getInventoryReceipts")

      throw new Error(resolveGetInventoryReceiptsErrorMessage(error))
    }
  })
