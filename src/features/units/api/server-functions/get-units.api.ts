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
  scope: z.enum(["CONSUMABLE", "PRODUCT"]).optional(),
  q: z.string().optional(),
})

export const getUnits = createServerFn({ method: "GET" })
  .validator(getUnitsSchema)
  .handler(async ({ data }): Promise<UnitDetail[]> => {
    try {
      // `scope` is optional at the wire level so the Đơn vị tính admin screen
      // can list every unit — `unitOptionsQueryOptions` (the dropdown consumables/products/BOM
      // COMPONENT read) passes one whenever the target write actually validates by scope
      // (product/consumable create-update), and omits it for the BOM COMPONENT unit picker,
      // which the backend never scope-checks.
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
