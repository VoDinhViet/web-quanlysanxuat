import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductOperationSchema } from "@/features/products/schemas/create-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateItemOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "item.error.raw_material_not_allowed":
      return "Vật tư không có công đoạn riêng."
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn trong danh mục."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const createItemOperationInputSchema = createProductOperationSchema.extend({
  itemId: z.uuid(),
  sortOrder: z.number().int().min(0),
})

export const createItemOperation = createServerFn({ method: "POST" })
  .validator(createItemOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, ...rest } = data
      await http.post(`/api/items/${itemId}/operations`, rest)
    } catch (error) {
      logHttpError(error, "createItemOperation")

      throw new Error(resolveCreateItemOperationErrorMessage(error))
    }
  })
