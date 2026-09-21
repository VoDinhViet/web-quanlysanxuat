import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductionOrder } from "@/lib/types/production-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `dueDateFrom`/`dueDateTo` rename to `startDate`/`endDate` here — GetProductionOrdersReqDto's
// field names (the URL param names stay as-is so existing links keep working; only the wire
// shape changes).
const getProductionOrdersParamsSchema = productionOrdersSearchSchema.transform(
  ({ dueDateFrom, dueDateTo, ...rest }) => ({
    ...rest,
    startDate: dueDateFrom,
    endDate: dueDateTo,
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductionOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách lệnh sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductionOrders = createServerFn({ method: "GET" })
  .validator(getProductionOrdersParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<ProductionOrder>> => {
    try {
      const response = await http.get<PaginatedResponse<ProductionOrder>>(
        "/api/production-orders",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductionOrders")

      throw new Error(resolveGetProductionOrdersErrorMessage(error))
    }
  })
