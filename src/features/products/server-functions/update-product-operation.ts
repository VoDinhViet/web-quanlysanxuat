import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateProductOperationSchema } from "@/features/products/schemas/update-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductOperation } from "@/features/products/types/operation.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateProductOperationInputSchema = updateProductOperationSchema.extend({
  productId: z.uuid(),
  stepId: z.uuid(),
})

export const updateProductOperation = createServerFn({ method: "POST" })
  .validator(updateProductOperationInputSchema)
  .handler(async ({ data }): Promise<ProductOperation> => {
    try {
      const { productId, stepId, ...rest } = data
      const response = await http.patch<ProductOperation>(
        `/api/products/${productId}/operations/${stepId}`,
        rest
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductOperation")

      throw new Error(resolveUpdateProductOperationErrorMessage(error))
    }
  })
