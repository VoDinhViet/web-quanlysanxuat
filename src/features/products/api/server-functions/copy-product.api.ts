import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Product } from "@/lib/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCopyProductErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const copyProduct = createServerFn({ method: "POST" })
  .validator(z.object({ productId: z.uuid() }))
  .handler(async ({ data }): Promise<Product> => {
    try {
      const response = await http.post<Product>(
        `/api/items/${data.productId}/copy`
      )

      return response.data
    } catch (error) {
      logHttpError(error, "copyProduct")

      throw new Error(resolveCopyProductErrorMessage(error))
    }
  })
