import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import {
  arrayBufferToBase64,
  getFilenameFromContentDisposition,
} from "@/lib/export.util"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultTemplateFilename = "mau-nhap-ton-kho.xlsx"

function resolveDownloadInventoryTemplateErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền nhập tồn kho từ Excel."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type InventoryImportTemplateResult = { base64: string; filename: string }

// GET /api/inventory-directs/import-template — backend sinh file điền sẵn vật tư và tồn hiện tại.
export const downloadInventoryImportTemplate = createServerFn({
  method: "GET",
}).handler(async (): Promise<InventoryImportTemplateResult> => {
  try {
    const response = await http.get<ArrayBuffer>(
      "/api/inventory-directs/import-template",
      { responseType: "arraybuffer" }
    )

    const filename = getFilenameFromContentDisposition(
      response.headers["content-disposition"],
      defaultTemplateFilename
    )

    return { base64: arrayBufferToBase64(response.data), filename }
  } catch (error) {
    logHttpError(error, "downloadInventoryImportTemplate")

    throw new Error(resolveDownloadInventoryTemplateErrorMessage(error))
  }
})
