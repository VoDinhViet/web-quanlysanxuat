import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PendingOrderItem } from "@/lib/types/outsourcing-receipt.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPendingOrderItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách hàng cần nhận."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Khớp GetPendingOrderItemsReqDto (extends PageOptionsDto) — chỉ page/limit/q/operationId, BE
// chưa có filter supplierId/onlyRemaining ở endpoint này.
const getPendingOrderItemsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  operationId: optional(z.string().trim()),
})

export const getPendingOrderItems = createServerFn({ method: "GET" })
  .validator(getPendingOrderItemsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<PendingOrderItem>> => {
    try {
      const response = await http.get<PaginatedResponse<PendingOrderItem>>(
        "/api/outsourcing-receipts/pending-order-items",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getPendingOrderItems")

      throw new Error(resolveGetPendingOrderItemsErrorMessage(error))
    }
  })
