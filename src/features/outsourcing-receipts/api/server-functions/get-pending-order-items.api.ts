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

// Wire shape of PendingOrderItemResDto — nested outsourcingOrder/productionJob/item refs the
// backend returns, narrowed to only the sub-fields actually read below. `supplier` lồng trong
// `outsourcingOrder` (OutsourcingOrderWithSupplierRefResDto), không phải field top-level.
// Flattened into PendingOrderItem so PickerColumns/PickerSection keep flat field names, cùng
// khuôn get-outsourceable-operations.api.ts (OS-OUT's own picker).
type PendingOrderItemWireRow = {
  id: string
  outsourcingOrder: {
    id: string
    code: string
    sendDate: string
    supplier: { id: string; name: string }
  }
  productionJob: { code: string } | null
  item: { code: string; name: string; unit: { name: string } }
  operationCode: string
  operationName: string
  quantity: number
  weight: number | null
  area: number | null
}

export const getPendingOrderItems = createServerFn({ method: "GET" })
  .validator(getPendingOrderItemsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<PendingOrderItem>> => {
    try {
      const response = await http.get<
        PaginatedResponse<PendingOrderItemWireRow>
      >("/api/outsourcing-receipts/pending-order-items", { params: data })

      return {
        ...response.data,
        data: response.data.data.map((row) => ({
          outsourcingOrderItemId: row.id,
          outsourcingOrderId: row.outsourcingOrder.id,
          outsourcingOrderCode: row.outsourcingOrder.code,
          sendDate: row.outsourcingOrder.sendDate,
          supplierId: row.outsourcingOrder.supplier.id,
          supplierName: row.outsourcingOrder.supplier.name,
          productionJobCode: row.productionJob?.code ?? null,
          itemCode: row.item.code,
          itemName: row.item.name,
          unitName: row.item.unit.name,
          operationCode: row.operationCode,
          operationName: row.operationName,
          sentQuantity: row.quantity,
          weight: row.weight,
          area: row.area,
        })),
      }
    } catch (error) {
      logHttpError(error, "getPendingOrderItems")

      throw new Error(resolveGetPendingOrderItemsErrorMessage(error))
    }
  })
