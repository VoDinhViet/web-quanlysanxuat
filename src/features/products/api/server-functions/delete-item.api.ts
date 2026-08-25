import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm/vật tư."
    case "item.error.in_use":
      return "Sản phẩm/vật tư đã gắn Đơn hàng hoặc Lệnh sản xuất, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá sản phẩm/vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteItem = createServerFn({ method: "POST" })
  .validator(z.object({ itemId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/items/${data.itemId}`)
    } catch (error) {
      logHttpError(error, "deleteItem")

      throw new Error(resolveDeleteItemErrorMessage(error))
    }
  })
