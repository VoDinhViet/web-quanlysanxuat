import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { iqcSearchSchema } from "@/features/iqc/schemas/iqc-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "iqc.xlsx"

function resolveExportIqcErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách IQC."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Backend (`ExportIqcReqDto`) còn nhận thêm `clientId`/`disposition` mà `iqcSearchSchema` chưa
// expose trên URL — bỏ qua, không ảnh hưởng: thiếu field optional chỉ nghĩa là không lọc theo nó.
const exportIqcParamsSchema = iqcSearchSchema.pick({
  q: true,
  supplierId: true,
  result: true,
  status: true,
})

export type ExportIqcResult = { base64: string; filename: string }

// `responseType: "arraybuffer"` vì server function chạy Node, không có Blob của DOM — decode
// base64 thành Blob ở client qua `downloadBase64File`. Filename đọc từ `Content-Disposition` backend
// trả sẵn, không tự sinh lại ở FE.
export const exportIqc = createServerFn({ method: "GET" })
  .validator(exportIqcParamsSchema)
  .handler(async ({ data }): Promise<ExportIqcResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/iqc/export", {
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
      logHttpError(error, "exportIqc")

      throw new Error(resolveExportIqcErrorMessage(error))
    }
  })
