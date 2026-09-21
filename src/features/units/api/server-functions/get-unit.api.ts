import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { UnitDetail } from "@/lib/types/unit.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetUnitErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "unit.error.not_found":
      return "Không tìm thấy đơn vị tính."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getUnit = createServerFn({ method: "GET" })
  .validator(z.object({ unitId: z.uuid() }))
  .handler(async ({ data }): Promise<UnitDetail> => {
    try {
      const response = await http.get<UnitDetail>(`/api/units/${data.unitId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getUnit")

      throw new Error(resolveGetUnitErrorMessage(error))
    }
  })
