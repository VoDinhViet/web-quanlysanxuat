import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductOperationSchema } from "@/features/products/schemas/create-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductOperationErrorMessage(error: unknown): string {
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

const createProductOperationInputSchema = createProductOperationSchema.extend({
  productId: z.uuid(),
  sortOrder: z.number().int().min(0),
})

export const createProductOperation = createServerFn({ method: "POST" })
  .validator(createProductOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productId, ...rest } = data
      await http.post(`/api/items/${productId}/operations`, rest)
    } catch (error) {
      logHttpError(error, "createProductOperation")

      throw new Error(resolveCreateProductOperationErrorMessage(error))
    }
  })
