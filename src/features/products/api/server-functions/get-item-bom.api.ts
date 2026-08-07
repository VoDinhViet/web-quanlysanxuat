import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { BomItem } from "@/lib/types/bom-item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetItemBomErrorMessage(error: unknown): string {
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

export const getItemBom = createServerFn({ method: "GET" })
  .validator(z.object({ itemId: z.uuid() }))
  .handler(async ({ data }): Promise<BomItem[]> => {
    try {
      const response = await http.get<BomItem[]>(
        `/api/items/${data.itemId}/bom`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getItemBom")

      throw new Error(resolveGetItemBomErrorMessage(error))
    }
  })
