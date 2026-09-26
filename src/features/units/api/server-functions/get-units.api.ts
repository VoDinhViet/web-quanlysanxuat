import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { UnitStatus, UnitType } from "@/lib/types/unit.type"
import type { UnitDetail } from "@/lib/types/unit.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUnitsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const getUnitsSchema = z.object({
  q: z.string().optional(),
  type: z.enum(UnitType).optional(),
  status: z.enum(UnitStatus).optional(),
})

export const getUnits = createServerFn({ method: "GET" })
  .validator(getUnitsSchema)
  .handler(async ({ data }): Promise<UnitDetail[]> => {
    try {
      // Unlike the other reference lists, /units is not paginated: it returns
      // a bare array, so there is no envelope to unwrap and no `limit` to cap.
      const response = await http.get<UnitDetail[]>("/api/units", {
        params: { q: data.q, type: data.type, status: data.status },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUnits")

      throw new Error(resolveGetUnitsErrorMessage(error))
    }
  })
