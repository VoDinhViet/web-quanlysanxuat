import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateProductSchema } from "@/features/products/schemas/update-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import {
  resolveApiAttachmentFileIds,
  resolveApiFileId,
} from "@/lib/file-field.schema"
import type { Product } from "@/lib/types/product.type"

// `image`/`attachments` carry display URLs the backend has no field for — only the file ids go
// on the wire. `updateProductSchema` already leaves every other field wire-ready
// (emptyToNull-transformed), so this only maps file ids.
const updateProductPayloadSchema = updateProductSchema.transform(
  ({ image, attachments, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "update"),
    attachmentFileIds: resolveApiAttachmentFileIds(attachments),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateProductErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "product.error.not_found":
      return "Không tìm thấy sản phẩm."
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

export const updateProduct = createServerFn({ method: "POST" })
  .validator(updateProductPayloadSchema)
  .handler(async ({ data }): Promise<Product> => {
    try {
      const { productId, ...payload } = data
      const response = await http.patch<Product>(
        `/api/products/${productId}`,
        payload
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProduct")

      throw new Error(resolveUpdateProductErrorMessage(error))
    }
  })
