import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { ProductRevision } from "@/features/products/types/product-revision.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveActivateProductRevisionErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const activateProductRevision = createServerFn({ method: "POST" })
  .validator(z.object({ productId: z.uuid(), revisionId: z.uuid() }))
  .handler(async ({ data }): Promise<ProductRevision> => {
    try {
      const response = await http.post<ProductRevision>(
        `/api/products/${data.productId}/revisions/${data.revisionId}/activate`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "activateProductRevision")

      throw new Error(resolveActivateProductRevisionErrorMessage(error))
    }
  })
