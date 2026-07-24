import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { z } from "zod"

import { updateProductSchema } from "@/features/products/schemas/update-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { Product } from "@/features/products/types/product.type"

type ValidatedUpdate = Omit<z.output<typeof updateProductSchema>, "productId">

// The update form always submits the complete form state, so a clearable field
// that validated to undefined was emptied by the user. On PATCH a missing key
// means "no change" — send an explicit null so the backend actually clears it.
// `code`/`name` are left as-is (undefined ⇒ dropped ⇒ unchanged); only the
// nullable relations/text below are cleared with null.
function toUpdateProductPayload(data: ValidatedUpdate) {
  // `image` carries a display URL the backend has no field for — only the file
  // id goes on the wire, so it is destructured out rather than spread.
  const { image, attachments, ...rest } = data

  return {
    ...rest,
    attachmentFileIds: attachments.map((attachment) => attachment.id),
    clientId: data.clientId ?? null,
    productGroupId: data.productGroupId ?? null,
    imageFileId: image?.id ?? null,
    note: data.note ?? null,
  }
}

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
  .validator(updateProductSchema)
  .handler(async ({ data }): Promise<Product> => {
    try {
      const { productId, ...payload } = data
      const response = await http.patch<Product>(
        `/api/products/${productId}`,
        toUpdateProductPayload(payload)
      )

      return response.data
    } catch (error) {
      logHttpError(error, "updateProduct")

      throw new Error(resolveUpdateProductErrorMessage(error))
    }
  })
