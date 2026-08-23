import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { WarehouseRef } from "@/lib/types/warehouse.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

const getWarehouseOptionsSchema = z.object({
  type: z.enum(["RM", "FG", "WIP"]).optional(),
})

export type GetWarehouseOptionsParams = z.infer<
  typeof getWarehouseOptionsSchema
>

function resolveGetWarehouseOptionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getWarehouseOptions = createServerFn({ method: "GET" })
  .validator(getWarehouseOptionsSchema)
  .handler(async ({ data }): Promise<WarehouseRef[]> => {
    try {
      // Dedicated dropdown endpoint (capped at 100) — not paginated,
      // same shape as /units and /countries. `type` optional lọc theo loại kho.
      const response = await http.get<WarehouseRef[]>(
        "/api/warehouses/options",
        {
          params: data,
        }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getWarehouseOptions")

      throw new Error(resolveGetWarehouseOptionsErrorMessage(error))
    }
  })
