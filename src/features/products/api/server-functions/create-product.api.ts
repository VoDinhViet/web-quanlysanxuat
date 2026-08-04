import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createProductSchema } from "@/features/products/schemas/create-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// The form holds the whole uploaded-file object so it can render a preview; the
// backend only wants the file id.
const createProductPayloadSchema = createProductSchema.transform(
  ({ image, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "create"),
  })
)

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
  .validator(createProductPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/products", data)
    } catch (error) {
      logHttpError(error, "createProduct")

      throw new Error(resolveCreateProductErrorMessage(error))
    }
  })
