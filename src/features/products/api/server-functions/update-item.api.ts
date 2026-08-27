import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateProductSchema } from "@/features/products/schemas/update-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId, resolveApiFileIds } from "@/lib/file-field.schema"

// `image`/`files` carry a display URL the backend has no field for — only the file id(s) go on
// the wire. `updateProductSchema` already leaves every other field wire-ready (emptyToNull-
// transformed), so this only maps the file fields.
const updateProductPayloadSchema = updateProductSchema.transform(
  ({ image, files, ...rest }) => ({
    ...rest,
    imageFileId: resolveApiFileId(image, "update"),
    fileIds: resolveApiFileIds(files),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "item.error.code_exists":
      return "Mã sản phẩm đã tồn tại."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "unit.error.not_found":
      return "Đơn vị tính không tồn tại."
    case "unit.error.scope_mismatch":
      return "Đơn vị tính không dùng được cho loại này."
    case "client.error.not_found":
      return "Khách hàng không tồn tại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateItem = createServerFn({ method: "POST" })
  .validator(updateProductPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { itemId, ...payload } = data
      await http.patch(`/api/items/${itemId}`, payload)
    } catch (error) {
      logHttpError(error, "updateItem")

      throw new Error(resolveUpdateItemErrorMessage(error))
    }
  })
