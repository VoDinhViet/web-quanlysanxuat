import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductOperationSchema } from "@/features/products/schemas/create-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateBomOperationErrorMessage(error: unknown): string {
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
    case "operation.error.not_found":
      return "Không tìm thấy công đoạn trong danh mục."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const createBomOperationInputSchema = createProductOperationSchema.extend({
  itemId: z.uuid(),
  bomItemId: z.uuid(),
  sortOrder: z.number().int().min(0),
})

export const createBomOperation = createServerFn({ method: "POST" })
  .validator(createBomOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, bomItemId, ...rest } = data
      await http.post(
        `/api/items/${itemId}/bom/items/${bomItemId}/operations`,
        rest
      )
    } catch (error) {
      logHttpError(error, "createBomOperation")

      throw new Error(resolveCreateBomOperationErrorMessage(error))
    }
  })
