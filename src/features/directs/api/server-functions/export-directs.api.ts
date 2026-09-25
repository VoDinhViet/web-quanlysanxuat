import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { directsSearchSchema } from "@/features/directs/schemas/directs-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "vat-tu.xlsx"

function resolveExportDirectsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportDirectsParamsSchema = directsSearchSchema.pick({
  q: true,
  status: true,
  clientId: true,
})

export type ExportDirectsResult = { base64: string; filename: string }

// `type` không nằm trong schema này — cố định "DIRECT" mỗi lần gọi, mirror get-directs.api.ts.
// Filename đọc từ `Content-Disposition` backend trả sẵn, không tự sinh lại ở FE.
export const exportDirects = createServerFn({ method: "GET" })
  .validator(exportDirectsParamsSchema)
  .handler(async ({ data }): Promise<ExportDirectsResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/items/export", {
        params: { ...data, type: "DIRECT" },
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
      logHttpError(error, "exportDirects")

      throw new Error(resolveExportDirectsErrorMessage(error))
    }
  })
