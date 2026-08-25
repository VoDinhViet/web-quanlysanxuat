import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
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
  scope: z.enum(["MATERIAL", "PRODUCT"]).optional(),
  q: z.string().optional(),
})

export const getUnits = createServerFn({ method: "GET" })
  .validator(getUnitsSchema)
  .handler(async ({ data }): Promise<UnitDetail[]> => {
    try {
      // `scope` is optional at the wire level so the Đơn vị tính admin screen
      // can list every unit — but `unitOptionsQueryOptions` (the dropdown
      // materials/products read) always passes one: omitting it there would
      // let a user pick a unit whose create/update then rejects with
      // unit.error.scope_mismatch, so filter at the source instead.
      //
      // Unlike the other reference lists, /units is not paginated: it returns
      // a bare array, so there is no envelope to unwrap and no `limit` to cap.
      const response = await http.get<UnitDetail[]>("/api/units", {
        params: { scope: data.scope, q: data.q },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "getUnits")

      throw new Error(resolveGetUnitsErrorMessage(error))
    }
  })
