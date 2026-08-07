import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteBomItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "bom_item.error.not_found":
      return "Không tìm thấy hạng mục."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteBomItem = createServerFn({ method: "POST" })
  .validator(
    z.object({
      productId: z.uuid(),
      bomItemId: z.uuid(),
    })
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(
        `/api/items/${data.productId}/bom/items/${data.bomItemId}`
      )
    } catch (error) {
      logHttpError(error, "deleteBomItem")

      throw new Error(resolveDeleteBomItemErrorMessage(error))
    }
  })
