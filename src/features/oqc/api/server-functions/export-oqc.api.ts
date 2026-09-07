import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { oqcSearchSchema } from "@/features/oqc/schemas/oqc-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "oqc.xlsx"

function resolveExportOqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách OQC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportOqcParamsSchema = oqcSearchSchema.pick({
  q: true,
  itemId: true,
  result: true,
  status: true,
  disposition: true,
  startDate: true,
  endDate: true,
})

export type ExportOqcResult = { base64: string; filename: string }

// `responseType: "arraybuffer"` vì server function chạy Node, không có Blob của DOM — decode
// base64 thành Blob ở client qua `downloadBase64File`. Filename đọc từ `Content-Disposition` backend
// trả sẵn, không tự sinh lại ở FE.
export const exportOqc = createServerFn({ method: "GET" })
  .validator(exportOqcParamsSchema)
  .handler(async ({ data }): Promise<ExportOqcResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/oqc/export", {
        params: data,
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
      logHttpError(error, "exportOqc")

      throw new Error(resolveExportOqcErrorMessage(error))
    }
  })
