import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { z } from "zod"

import { productFormSchema } from "@/features/products/schemas/product-form.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Product } from "@/features/products/types/product.type"

type ValidatedCreate = z.output<typeof productFormSchema>

// The form holds the whole uploaded-file object so it can render a preview; the
// backend only wants the file id.
function toCreateProductPayload(data: ValidatedCreate) {
  const { image, attachments, ...rest } = data

  return {
    ...rest,
    imageFileId: image?.id,
    attachmentFileIds: attachments.map((attachment) => attachment.id),
  }
}

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateProductErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.code_exists":
      return "Mã sản phẩm đã tồn tại."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
    case "unit.error.scope_mismatch":
      return "Đơn vị tính không dùng được cho loại này."
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
  .validator(productFormSchema)
  .handler(async ({ data }): Promise<Product> => {
    try {
      const response = await http.post<Product>(
        "/api/products",
        toCreateProductPayload(data)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createProduct")

      throw new Error(resolveCreateProductErrorMessage(error))
    }
  })
