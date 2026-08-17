import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { OutsourceableOperation } from "@/lib/types/outsourcing-order.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetOutsourceableOperationsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách chi tiết cần gia công."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getOutsourceableOperationsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  productionJobId: optional(z.string().trim()),
  operationId: optional(z.string().trim()),
})

// Wire shape of OutsourceableOperationResDto — nested job/part/operation/unit refs the backend
// returns, narrowed to only the sub-fields actually read below (e.g. `job.id`/`unit.id`/
// `unit.code`/`operation.code` come back on the wire too but nothing here needs them). Flattened
// into the FE's existing OutsourceableOperation shape so PickerColumns/PickerSection keep their
// current field names untouched.
type OutsourceableOperationWireItem = {
  productionJobOperationId: string
  job: { code: string }
  part: { code: string; name: string }
  operation: { name: string }
  unit: { name: string }
  plannedQuantity: number
  sentQuantity: number
  remainingQuantity: number
}

export const getOutsourceableOperations = createServerFn({ method: "GET" })
  .validator(getOutsourceableOperationsSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<OutsourceableOperation>> => {
      try {
        const response = await http.get<
          PaginatedResponse<OutsourceableOperationWireItem>
        >("/api/outsourcing-orders/outsourceable-operations", {
          params: data,
        })

        return {
          ...response.data,
          data: response.data.data.map((item) => ({
            id: item.productionJobOperationId,
            productionJobCode: item.job.code,
            itemCode: item.part.code,
            itemName: item.part.name,
            operationName: item.operation.name,
            unitName: item.unit.name,
            plannedQuantity: item.plannedQuantity,
            sentQuantity: item.sentQuantity,
            remainingQuantity: item.remainingQuantity,
          })),
        }
      } catch (error) {
        logHttpError(error, "getOutsourceableOperations")

        throw new Error(resolveGetOutsourceableOperationsErrorMessage(error))
      }
    }
  )
