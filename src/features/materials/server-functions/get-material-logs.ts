import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { MaterialLog } from "@/features/materials/types/material.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

const getMaterialLogsSchema = z.object({
  materialId: z.uuid(),
  page: z.number().int().min(1).catch(1),
  limit: z.union([z.literal(10), z.literal(20), z.literal(50)]).catch(10),
})

function resolveGetMaterialLogsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "material.error.not_found":
      return "Không tìm thấy vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getMaterialLogs = createServerFn({ method: "GET" })
  .validator(getMaterialLogsSchema)
  .handler(async ({ data }): Promise<PaginatedResponse<MaterialLog>> => {
    try {
      const { materialId, ...params } = data
      const response = await http.get<PaginatedResponse<MaterialLog>>(
        `/api/materials/${materialId}/logs`,
        { params }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getMaterialLogs")

      throw new Error(resolveGetMaterialLogsErrorMessage(error))
    }
  })
