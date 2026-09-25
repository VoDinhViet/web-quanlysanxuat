import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { copyProductSchema } from "@/features/products/schemas/copy-product.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCopyItemErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "item.error.not_found":
      return "Không tìm thấy sản phẩm."
    case "item.error.code_exists":
      return "Mã + phiên bản này đã tồn tại."
    case "item.error.cannot_copy_direct":
      return "Không thể nhân bản vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// POST /api/items/:id/copy — the copy keeps the source's `code`; the backend returns 204, the
// caller invalidates ["items"] and re-navigates to the list itself (no id/code to jump to here).
export const copyItem = createServerFn({ method: "POST" })
  .validator(copyProductSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post(`/api/items/${data.itemId}/copy`, {
        revision: data.revision,
      })
    } catch (error) {
      logHttpError(error, "copyItem")

      throw new Error(resolveCopyItemErrorMessage(error))
    }
  })
