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

// Wire shape of OutsourcingOrderBaseResDto — narrowed to only the sub-fields actually read
// below. BE có `status` (DB status) riêng với `progress` (suy từ status + SL từng dòng) — chỉ
// `progress` được dùng, khớp đúng FE's OutsourcingOrderStatus (xem outsourcing-order.type.ts).
// Không có operationName/unit/receivedQuantity cấp-order: một phiếu có thể nhiều dòng khác công
// đoạn/ĐVT, nên gộp từ `items[]` bên dưới thay vì lấy phẳng từ response.
type OutsourcingOrderWireItem = {
  operationName: string
  receivedQuantity: number
  item: { unit: { code: string; name: string } }
}

type OutsourcingOrderWireRow = {
  id: string
  code: string
  supplier: { name: string }
  sendDate: string
  expectedReturnDate: string | null
  progress: OutsourcingOrder["status"]
  totalQuantity: number
  createdAt: string
  items: OutsourcingOrderWireItem[]
}

export const getOutsourcingOrders = createServerFn({ method: "GET" })
  .validator(getOutsourcingOrdersParamsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<OutsourcingOrder>> => {
    try {
      const response = await http.get<
        PaginatedResponse<OutsourcingOrderWireRow>
      >("/api/outsourcing-orders", { params: data })

      return {
        ...response.data,
        data: response.data.data.map((row) => {
          const operationName = Array.from(
            new Set(row.items.map((item) => item.operationName))
          ).join(", ")
          const receivedQuantity = row.items.reduce(
            (sum, item) => sum + item.receivedQuantity,
            0
          )
          const unitCodes = new Set(
            row.items.map((item) => item.item.unit.code)
          )
          const unit =
            unitCodes.size === 1 ? (row.items[0]?.item.unit.name ?? "--") : "--"

          return {
            id: row.id,
            code: row.code,
            createdAt: row.createdAt,
            sentDate: row.sendDate,
            supplierName: row.supplier.name,
            operationName,
            totalQuantity: row.totalQuantity,
            receivedQuantity,
            unit,
            status: row.progress,
            expectedReturnDate: row.expectedReturnDate,
          }
        }),
      }
    } catch (error) {
      logHttpError(error, "getOutsourcingOrders")

      throw new Error(resolveGetOutsourcingOrdersErrorMessage(error))
    }
  })
