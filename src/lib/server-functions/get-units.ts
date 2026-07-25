import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Unit } from "@/lib/types/unit.type"

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
  scope: z.enum(["MATERIAL", "PRODUCT"]),
})

export const getUnits = createServerFn({ method: "GET" })
  .validator(getUnitsSchema)
  .handler(async ({ data }): Promise<Unit[]> => {
    try {
      // `scope` is required as of 2026-07-20: omitting it returns every unit,
      // and create/update material/product then reject an out-of-scope one
      // with unit.error.scope_mismatch — so filter at the source and never
      // offer a choice the backend will refuse.
      //
      // Unlike the other reference lists, /units is not paginated: it returns
      // a bare array, so there is no envelope to unwrap and no `limit` to cap.
      const response = await http.get<Unit[]>("/api/units", {
        params: { scope: data.scope },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUnits")

      throw new Error(resolveGetUnitsErrorMessage(error))
    }
  })
