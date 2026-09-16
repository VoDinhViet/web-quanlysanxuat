import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { ItemStatus } from "@/lib/types/item.type"
import type { Item } from "@/lib/types/item.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getItemsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  clientId: z.string().trim().min(1).optional(),
  status: z.enum(ItemStatus).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
})

// Trang Sản phẩm chỉ còn liệt kê FG (`docs/decisions/wip-removal.md`) — luôn gửi cứng
// `type=FG`, không còn field lọc "Loại sản phẩm" trên UI.
export const getItems = createServerFn({ method: "GET" })
  .validator(getItemsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<Item>> => {
    try {
      const response = await http.get<PaginatedResponse<Item>>("/api/items", {
        params: { ...data, type: "FG" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getItems")

      throw new Error(resolveGetItemsErrorMessage(error))
    }
  })
