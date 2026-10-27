import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createItemCategorySchema } from "@/features/item-categories/schemas/create-item-category.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { emptyToUndefined } from "@/lib/zod-transforms"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateItemCategoryErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item_category.error.code_exists":
      return "Mã nhóm vật tư đã tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền tạo nhóm vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createItemCategory = createServerFn({ method: "POST" })
  .validator(
    createItemCategorySchema.transform((value) => ({
      ...value,
      description: emptyToUndefined(value.description),
    }))
  )
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/item-categories", data)
    } catch (error) {
      logHttpError(error, "createItemCategory")

      throw new Error(resolveCreateItemCategoryErrorMessage(error))
    }
  })
