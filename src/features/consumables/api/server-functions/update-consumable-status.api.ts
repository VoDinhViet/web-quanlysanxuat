import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateConsumableStatusSchema } from "@/features/consumables/schemas/update-consumable-status.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateConsumableStatusErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateConsumableStatus = createServerFn({ method: "POST" })
  .validator(updateConsumableStatusSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.patch(`/api/items/${data.consumableId}`, {
        status: data.status,
      })
    } catch (error) {
      logHttpError(error, "updateConsumableStatus")

      throw new Error(resolveUpdateConsumableStatusErrorMessage(error))
    }
  })
