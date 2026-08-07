import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Item } from "@/lib/types/item.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCopyItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const copyItem = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.uuid() }))
  .handler(async ({ data }): Promise<Item> => {
    try {
      const response = await http.post<Item>(`/api/items/${data.itemId}/copy`)

      return response.data
    } catch (error) {
      logHttpError(error, "copyItem")

      throw new Error(resolveCopyItemErrorMessage(error))
    }
  })
