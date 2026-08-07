import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateProductOperationSchema } from "@/features/products/schemas/update-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateItemOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "routing_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateItemOperationInputSchema = updateProductOperationSchema.extend({
  itemId: z.uuid(),
  stepId: z.uuid(),
})

export const updateItemOperation = createServerFn({ method: "POST" })
  .validator(updateItemOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, stepId, ...rest } = data
      await http.patch(`/api/items/${itemId}/operations/${stepId}`, rest)
    } catch (error) {
      logHttpError(error, "updateItemOperation")

      throw new Error(resolveUpdateItemOperationErrorMessage(error))
    }
  })
