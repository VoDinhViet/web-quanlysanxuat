import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Item } from "@/lib/types/item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getItem = createServerFn({ method: "GET" })
  .validator(z.object({ itemId: z.uuid() }))
  .handler(async ({ data }): Promise<Item> => {
    try {
      const response = await http.get<Item>(`/api/items/${data.itemId}`)

      return response.data
    } catch (error) {
      logHttpError(error, "getItem")

      throw new Error(resolveGetItemErrorMessage(error))
    }
  })
