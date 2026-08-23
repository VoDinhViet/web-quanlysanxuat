import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryRequisitionLine } from "@/lib/types/inventory-requisition.type"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

const getRequisitionLinesSchema = z.object({
  warehouseId: z.uuid(),
  productionJobId: z.uuid().optional(),
  page: z.number(),
  limit: z.number(),
  q: optional(z.string().trim()),
})

function resolveGetRequisitionLinesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xem danh sách vật tư có thể lãnh."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Popup chọn vật tư dùng chung cả 2 luồng "Lãnh từ LSX"/"Lãnh thủ công" — `productionJobId`
// optional quyết định có khoanh vùng theo định mức BOM của Job hay không, không phải hai API khác
// nhau. Ném lỗi như bình thường (không degrade về mảng rỗng như getProductionJobOptions) — đây là
// bảng chính của bước ②, rỗng âm thầm sẽ khiến user tưởng không có vật tư nào.
export const getRequisitionLines = createServerFn({ method: "GET" })
  .validator(getRequisitionLinesSchema)
  .handler(
    async ({ data }): Promise<PaginatedResponse<InventoryRequisitionLine>> => {
      try {
        const response = await http.get<
          PaginatedResponse<InventoryRequisitionLine>
        >("/api/inventory-requisitions/lines", { params: data })

        return response.data
      } catch (error) {
        logHttpError(error, "getRequisitionLines")

        throw new Error(resolveGetRequisitionLinesErrorMessage(error))
      }
    }
  )
