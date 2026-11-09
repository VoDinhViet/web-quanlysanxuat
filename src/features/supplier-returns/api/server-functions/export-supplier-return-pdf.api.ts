import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import {
  arrayBufferToBase64,
  getFilenameFromContentDisposition,
} from "@/lib/export"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "phieu-xuat-tra-nha-cung-cap.pdf"

function resolveExportSupplierReturnPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "supplier_return.error.not_found":
      return "Không tìm thấy phiếu xuất trả nhà cung cấp."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu xuất trả nhà cung cấp."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportSupplierReturnPdfResult = {
  base64: string
  filename: string
}

export const exportSupplierReturnPdf = createServerFn({ method: "GET" })
  .validator(z.object({ supplierReturnId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportSupplierReturnPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/supplier-returns/${data.supplierReturnId}/export-pdf`,
        { responseType: "arraybuffer" }
      )

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined

      return {
        base64: arrayBufferToBase64(response.data),
        filename: getFilenameFromContentDisposition(
          disposition,
          defaultExportFilename
        ),
      }
    } catch (error) {
      logHttpError(error, "exportSupplierReturnPdf")

      throw new Error(resolveExportSupplierReturnPdfErrorMessage(error))
    }
  })
