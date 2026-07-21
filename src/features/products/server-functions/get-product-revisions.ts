import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetProductRevisionsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getProductRevisions = createServerFn({ method: "GET" })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductRevision[]> => {
    try {
      const response = await http.get<ProductRevision[]>(
        `/api/products/${data.productId}/revisions`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "getProductRevisions")

      throw new Error(resolveGetProductRevisionsErrorMessage(error))
    }
  })
