import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import {
  arrayBufferToBase64,
  getFilenameFromContentDisposition,
} from "@/lib/export.util"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultTemplateFilename = "mau-nhap-vat-tu.xlsx"

function resolveDownloadTemplateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền tải file mẫu nhập vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type DirectImportTemplateResult = { base64: string; filename: string }

// GET /api/items/import-template — file mẫu lưu sẵn ở backend; filename lấy từ `Content-Disposition`.
export const downloadDirectImportTemplate = createServerFn({
  method: "GET",
}).handler(async (): Promise<DirectImportTemplateResult> => {
  try {
    const response = await http.get<ArrayBuffer>("/api/items/import-template", {
      responseType: "arraybuffer",
    })

    const filename = getFilenameFromContentDisposition(
      response.headers["content-disposition"],
      defaultTemplateFilename
    )

    return { base64: arrayBufferToBase64(response.data), filename }
  } catch (error) {
    logHttpError(error, "downloadDirectImportTemplate")

    throw new Error(resolveDownloadTemplateErrorMessage(error))
  }
})
