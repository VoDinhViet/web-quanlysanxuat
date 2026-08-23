import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { inventoryRequisitionsSearchSchema } from "@/features/inventory-requisitions/schemas/inventory-requisitions-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryRequisition } from "@/lib/types/inventory-requisition.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetInventoryRequisitionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu lãnh vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getInventoryRequisitions = createServerFn({ method: "GET" })
  .validator(inventoryRequisitionsSearchSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<InventoryRequisition>> => {
      try {
        const response = await http.get<
          PaginatedResponse<InventoryRequisition>
        >("/api/inventory-requisitions", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getInventoryRequisitions")

        throw new Error(resolveGetInventoryRequisitionsErrorMessage(error))
      }
    }
  )
