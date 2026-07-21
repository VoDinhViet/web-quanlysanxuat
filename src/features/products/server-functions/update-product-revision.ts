import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { updateProductRevisionSchema } from "@/features/products/schemas/update-product-revision.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductRevisionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product_revision.error.number_exists":
      return "Mã revision đã tồn tại."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateProductRevision = createServerFn({ method: "POST" })
  .validator(
    updateProductRevisionSchema.extend({
      productId: z.uuid(),
      revisionId: z.uuid(),
    })
  )
  .handler(async ({ data }): Promise<ProductRevision> => {
    try {
      const { productId, revisionId, ...payload } = data
      const response = await http.patch<ProductRevision>(
        `/api/products/${productId}/revisions/${revisionId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProductRevision")

      throw new Error(resolveUpdateProductRevisionErrorMessage(error))
    }
  })
