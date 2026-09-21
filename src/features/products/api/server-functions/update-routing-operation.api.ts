import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateProductOperationSchema } from "@/features/products/schemas/update-product-operation.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateRoutingOperationErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "bom_operation.error.not_found":
      return "Không tìm thấy bước công đoạn."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const updateRoutingOperationInputSchema = updateProductOperationSchema.extend(
  {
    itemId: z.uuid(),
    stepId: z.uuid(),
  }
)

export const updateRoutingOperation = createServerFn({ method: "POST" })
  .validator(updateRoutingOperationInputSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, stepId, ...rest } = data
      await http.patch(`/api/items/${itemId}/operations/${stepId}`, rest)
    } catch (error) {
      logHttpError(error, "updateRoutingOperation")

      throw new Error(resolveUpdateRoutingOperationErrorMessage(error))
    }
  })
