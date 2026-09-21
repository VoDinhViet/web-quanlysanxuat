import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { PaginatedResponse } from "@/lib/types/pagination.type"
import type { Position } from "@/lib/types/position.type"

const getPositionsSchema = z.object({
  departmentId: z.uuid().optional(),
  q: z.string().optional(),
})

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetPositionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getPositions = createServerFn({ method: "GET" })
  .validator(getPositionsSchema)
  .handler(async ({ data }): Promise<Position[]> => {
    try {
      // `departmentId` is optional at the wire level so the Chức vụ admin screen can list every
      // position — but the job-info dependent select always passes one (BE
      // `ensurePositionInDepartment` requires the pair to match).
      const response = await http.get<PaginatedResponse<Position>>(
        "/api/positions",
        { params: { limit: 100, departmentId: data.departmentId, q: data.q } }
      )

      return response.data.data
    } catch (error) {
      logHttpError(error, "getPositions")

      throw new Error(resolveGetPositionsErrorMessage(error))
    }
  })
