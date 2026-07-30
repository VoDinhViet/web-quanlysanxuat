import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrderLog } from "@/lib/types/production-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionOrderLogsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "auth.error.forbidden":
      return "Bạn không có quyền xem lịch sử lệnh sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// No filters beyond pagination — GetProductionOrderLogsReqDto is bare PageOptionsDto.
export const getProductionOrderLogs = createServerFn({ method: "GET" })
  .validator(
    z.object({
      productionOrderId: z.uuid(),
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
    })
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionOrderLog>> => {
    try {
      const { productionOrderId, page, limit } = data
      const response = await http.get<PaginatedResponse<ProductionOrderLog>>(
        `/api/production-orders/${productionOrderId}/logs`,
        { params: { page, limit } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionOrderLogs")

      throw new Error(resolveGetProductionOrderLogsErrorMessage(error))
    }
  })
