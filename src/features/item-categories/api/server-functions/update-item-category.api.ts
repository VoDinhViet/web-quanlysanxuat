import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateItemCategorySchema } from "@/features/item-categories/schemas/update-item-category.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToNull } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateItemCategoryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item_category.error.not_found":
      return "Không tìm thấy nhóm vật tư."
    case "item_category.error.code_exists":
      return "Mã nhóm vật tư đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền sửa nhóm vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateItemCategory = createServerFn({ method: "POST" })
  .validator(
    updateItemCategorySchema.transform((value) => ({
      ...value,
      // PATCH: an omitted key means "leave unchanged", so clearing needs an explicit null.
      description: emptyToNull(value.description),
    }))
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemCategoryId, ...payload } = data
      await http.patch(`/api/item-categories/${itemCategoryId}`, payload)
    } catch (error) {
      logHttpError(error, "updateItemCategory")

      throw new Error(resolveUpdateItemCategoryErrorMessage(error))
    }
  })
