import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductOperationSchema } from "@/features/products/schemas/create-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductOperation } from "@/features/products/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
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
  .handler(async ({ data }): Promise<ProductOperation> => {
    try {
      const { productId, ...rest } = data
      const response = await http.post<ProductOperation>(
        `/api/products/${productId}/operations`,
        rest
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createProductOperation")

      throw new Error(resolveCreateProductOperationErrorMessage(error))
    }
  })
