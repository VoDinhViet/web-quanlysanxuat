import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { copyConsumableSchema } from "@/features/consumables/schemas/copy-consumable.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCopyConsumableErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "item.error.code_exists":
      return "Mã vật tư đã tồn tại."
    case "item.error.consumable_code_required":
      return "Vui lòng nhập mã vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// POST /api/items/:id/copy — the backend returns 204; the caller invalidates ["consumables"].
export const copyConsumable = createServerFn({ method: "POST" })
  .validator(copyConsumableSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/items/${data.itemId}/copy`, {
        code: data.code,
        name: data.name,
      })
    } catch (error) {
      logHttpError(error, "copyConsumable")

      throw new Error(resolveCopyConsumableErrorMessage(error))
    }
  })
