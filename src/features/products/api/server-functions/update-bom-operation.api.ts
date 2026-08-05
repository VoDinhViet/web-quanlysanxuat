import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateProductOperationSchema } from "@/features/products/schemas/update-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateBomOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "bom_item.error.parent_not_found":
      return "Không tìm thấy hạng mục trong cấu trúc sản phẩm."
    case "bom_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateBomOperationInputSchema = updateProductOperationSchema.extend({
  productId: z.uuid(),
  itemId: z.uuid(),
  stepId: z.uuid(),
})

export const updateBomOperation = createServerFn({ method: "POST" })
  .validator(updateBomOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productId, itemId, stepId, ...rest } = data
      await http.patch(
        `/api/products/${productId}/bom/items/${itemId}/operations/${stepId}`,
        rest
      )
    } catch (error) {
      logHttpError(error, "updateBomOperation")

      throw new Error(resolveUpdateBomOperationErrorMessage(error))
    }
  })
