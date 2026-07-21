import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { createProductRevisionSchema } from "@/features/products/schemas/create-product-revision.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductRevisionErrorMessage(error: unknown): string {
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

export const createProductRevision = createServerFn({ method: "POST" })
  .validator(createProductRevisionSchema.extend({ productId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductRevision> => {
    try {
      const { productId, ...payload } = data
      const response = await http.post<ProductRevision>(
        `/api/products/${productId}/revisions`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createProductRevision")

      throw new Error(resolveCreateProductRevisionErrorMessage(error))
    }
  })
