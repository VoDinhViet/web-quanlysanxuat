import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { UnfulfilledOrderItem } from "@/lib/types/outbound-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUnfulfilledOrderItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách PO/Job cần giao."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Khớp GetUnfulfilledOrderItemsReqDto (extends PageOptionsDto) — chỉ page/limit thật sự lọc được:
// DTO có khai q/operationId nhưng getUnfulfilledOrderItems's `where` clause bên BE không dùng tới
// (đã soi lại service code), nên không gửi lên để tránh giả vờ có filter hoạt động.
const getUnfulfilledOrderItemsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
})

export const getUnfulfilledOrderItems = createServerFn({ method: "GET" })
  .validator(getUnfulfilledOrderItemsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<UnfulfilledOrderItem>> => {
      try {
        const response = await http.get<
          PaginatedResponse<UnfulfilledOrderItem>
        >("/api/outbound-orders/unfulfilled-order-items", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getUnfulfilledOrderItems")

        throw new Error(resolveGetUnfulfilledOrderItemsErrorMessage(error))
      }
    }
  )
