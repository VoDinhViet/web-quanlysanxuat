import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { HeldRequisitionsResult } from "@/lib/types/held-requisition.type"
import { optional } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetHeldRequisitionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  if (error.response?.status === 404) {
    return "Không tìm thấy vật tư."
  }

  return GENERIC_ERROR_MESSAGE
}

const getHeldRequisitionsSchema = z.object({
  itemId: z.uuid(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
  q: optional(z.string().trim()),
  departmentId: z.uuid().optional(),
  type: z.enum(["PRODUCTION", "OTHER"]).optional(),
})

// `GET /api/inventory-directs/:itemId/held-requisitions` — các phiếu lãnh `APPROVED` đang giữ
// vật tư, kèm `totalQuantity` của toàn bộ kết quả lọc.
export const getHeldRequisitions = createServerFn({ method: "GET" })
  .validator(getHeldRequisitionsSchema)
  .handler(async ({ data }): Promise<HeldRequisitionsResult> => {
    const { itemId, ...params } = data

    try {
      const response = await http.get<HeldRequisitionsResult>(
        `/api/inventory-directs/${itemId}/held-requisitions`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getHeldRequisitions")

      throw new Error(resolveGetHeldRequisitionsErrorMessage(error))
    }
  })
