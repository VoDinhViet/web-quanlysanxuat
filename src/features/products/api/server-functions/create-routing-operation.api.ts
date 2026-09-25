import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductOperationSchema } from "@/features/products/schemas/create-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateRoutingOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "item.error.direct_not_allowed":
      return "Vật tư không có công đoạn Cấp 0."
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn trong danh mục."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const createRoutingOperationInputSchema = createProductOperationSchema.extend({
  itemId: z.uuid(),
  sortOrder: z.number().int().min(0),
})

export const createRoutingOperation = createServerFn({ method: "POST" })
  .validator(createRoutingOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, ...rest } = data
      await http.post(`/api/items/${itemId}/operations`, rest)
    } catch (error) {
      logHttpError(error, "createRoutingOperation")

      throw new Error(resolveCreateRoutingOperationErrorMessage(error))
    }
  })
