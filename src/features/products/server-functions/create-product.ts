import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createProductSchema } from "@/features/products/schemas/create-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Product } from "@/features/products/types/product.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.code_exists":
      return "Mã sản phẩm đã tồn tại."
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
    case "product_group.error.not_found":
      return "Nhóm sản phẩm không tồn tại."
    case "client.error.not_found":
      return "Khách hàng không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createProduct = createServerFn({ method: "POST" })
  .validator(createProductSchema)
  .handler(async ({ data }): Promise<Product> => {
    try {
      const response = await http.post<Product>("/api/products", data)

      return response.data
    } catch (error) {
      logHttpError(error, "createProduct")

      throw new Error(resolveCreateProductErrorMessage(error))
    }
  })
