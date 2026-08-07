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
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "bom_item.error.parent_not_found":
      return "Không tìm thấy hạng mục trong cấu trúc sản phẩm."
    case "bom_operation.error.leaf_node":
      return "Vật tư là lá của cấu trúc — không gắn được công đoạn riêng."
    case "bom_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateBomOperationInputSchema = updateProductOperationSchema.extend({
  productId: z.uuid(),
  bomItemId: z.uuid(),
  stepId: z.uuid(),
})

export const updateBomOperation = createServerFn({ method: "POST" })
  .validator(updateBomOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { productId, bomItemId, stepId, ...rest } = data
      await http.patch(
        `/api/items/${productId}/bom/items/${bomItemId}/operations/${stepId}`,
        rest
      )
    } catch (error) {
      logHttpError(error, "updateBomOperation")

      throw new Error(resolveUpdateBomOperationErrorMessage(error))
    }
  })
