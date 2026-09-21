import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productsSearchSchema } from "@/features/products/schemas/products-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "san-pham.xlsx"

function resolveExportItemsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách sản phẩm."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportItemsParamsSchema = productsSearchSchema.pick({
  q: true,
  status: true,
  clientId: true,
})

export type ExportItemsResult = { base64: string; filename: string }

// Trang Sản phẩm chỉ còn xuất FG (cùng lý do get-items.api.ts) — luôn gửi cứng `type=FG`.
// Filename đọc từ `Content-Disposition` backend trả sẵn, không tự sinh lại ở FE.
export const exportItems = createServerFn({ method: "GET" })
  .validator(exportItemsParamsSchema)
  .handler(async ({ data }): Promise<ExportItemsResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/items/export", {
        params: { ...data, type: "FG" },
        responseType: "arraybuffer",
      })

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined
      const filename =
        /filename="?([^"]+)"?/.exec(disposition ?? "")?.[1] ??
        defaultExportFilename

      return {
        base64: Buffer.from(response.data).toString("base64"),
        filename,
      }
    } catch (error) {
      logHttpError(error, "exportItems")

      throw new Error(resolveExportItemsErrorMessage(error))
    }
  })
