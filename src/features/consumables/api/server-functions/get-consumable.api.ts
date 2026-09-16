import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Consumable } from "@/lib/types/consumable.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetConsumableErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getConsumable = createServerFn({ method: "GET" })
  .validator(z.object({ consumableId: z.uuid() }))
  .handler(async ({ data }): Promise<Consumable> => {
    try {
      const response = await http.get<Consumable>(`/api/items/${data.consumableId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getConsumable")

      throw new Error(resolveGetConsumableErrorMessage(error))
    }
  })
