import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Direct } from "@/lib/types/direct.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetDirectErrorMessage(error: unknown): string {
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

export const getDirect = createServerFn({ method: "GET" })
  .validator(z.object({ directId: z.uuid() }))
  .handler(async ({ data }): Promise<Direct> => {
    try {
      const response = await http.get<Direct>(`/api/items/${data.directId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getDirect")

      throw new Error(resolveGetDirectErrorMessage(error))
    }
  })
