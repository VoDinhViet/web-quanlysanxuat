import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outsourcingOrdersSearchSchema } from "@/features/outsourcing-orders/schemas/outsourcing-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourcingOrder } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"

// `status` ở search schema là OutsourcingOrderStatus (khớp BE's OutsourcingOrderProgress) — map
// sang param `progress` bên BE, không phải `status` (đó là DB status DRAFT/POSTED/CANCELLED,
// khái niệm khác — xem outsourcing-order.type.ts). `q` gửi thẳng, BE lọc theo Mã phiếu (code).
const getOutsourcingOrdersParamsSchema =
  outsourcingOrdersSearchSchema.transform(({ status, ...rest }) => ({
    ...rest,
    progress: status,
  }))

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourcingOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách phiếu gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// PageOutsourcingOrderResDto (GET /outsourcing-orders, danh sách) khớp thẳng OutsourcingOrder —
// không cần map lại (cùng idiom get-outsourcing-receipts.api.ts). BE tính totalQuantity/
// receivedQuantity/remainingQuantity thẳng ở dòng danh sách (SQL subquery), nhưng vẫn không có
// items/progress (chỉ OutsourcingOrderResDto, chi tiết từng phiếu, mới có — xem
// get-outsourcing-order.api.ts); `status` ở đây là DB status thật (DRAFT/POSTED/CANCELLED),
// không phải progress đã suy diễn.
export const getOutsourcingOrders = createServerFn({ method: "GET" })
  .validator(getOutsourcingOrdersParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OutsourcingOrder>> => {
    try {
      const response = await http.get<PaginatedResponse<OutsourcingOrder>>(
        "/api/outsourcing-orders",
        { params: data }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getOutsourcingOrders")

      throw new Error(resolveGetOutsourcingOrdersErrorMessage(error))
    }
  })
