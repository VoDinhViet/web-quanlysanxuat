import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveDeleteItemCategoryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item_category.error.not_found":
      return "Không tìm thấy nhóm vật tư."
    case "item_category.error.in_use":
      return "Nhóm vật tư đang được vật tư sử dụng, không thể xoá."
    case "auth.error.forbidden":
      return "Bạn không có quyền xoá nhóm vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const deleteItemCategory = createServerFn({ method: "POST" })
  .validator(z.object({ itemCategoryId: z.uuid() }))
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.delete(`/api/item-categories/${data.itemCategoryId}`)
    } catch (error) {
      logHttpError(error, "deleteItemCategory")

      throw new Error(resolveDeleteItemCategoryErrorMessage(error))
    }
  })
