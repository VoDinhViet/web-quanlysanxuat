import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ItemIssue } from "@/lib/types/item.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemIssuesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getItemIssuesSchema = z.object({
  itemId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
})

export const getItemIssues = createServerFn({ method: "GET" })
  .validator(getItemIssuesSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<ItemIssue>> => {
    try {
      const { itemId, ...params } = data
      const response = await http.get<PaginatedResponse<ItemIssue>>(
        `/api/items/${itemId}/issues`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getItemIssues")

      throw new Error(resolveGetItemIssuesErrorMessage(error))
    }
  })
