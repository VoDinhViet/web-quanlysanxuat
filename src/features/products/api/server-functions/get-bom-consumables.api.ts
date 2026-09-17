import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomConsumable } from "@/lib/types/bom-item.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetBomConsumablesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getBomConsumablesSchema = z.object({
  itemId: z.uuid(),
  bomItemId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: z.string().trim().min(1).optional(),
})

export const getBomConsumables = createServerFn({ method: "GET" })
  .validator(getBomConsumablesSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<BomConsumable>> => {
    try {
      const { itemId, bomItemId, ...params } = data
      const response = await http.get<PaginatedResponse<BomConsumable>>(
        `/api/items/${itemId}/bom/items/${bomItemId}/consumables`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getBomConsumables")

      throw new Error(resolveGetBomConsumablesErrorMessage(error))
    }
  })
