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
const defaultExportFilename = "phieu-nhap-gia-cong-ngoai.pdf"

function resolveExportOutsourcingReceiptPdfErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_receipt.error.not_found":
      return "Không tìm thấy phiếu nhập gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu nhập gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportOutsourcingReceiptPdfResult = {
  base64: string
  filename: string
}

export const exportOutsourcingReceiptPdf = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingReceiptId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportOutsourcingReceiptPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/outsourcing-receipts/${data.outsourcingReceiptId}/export-pdf`,
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
      logHttpError(error, "exportOutsourcingReceiptPdf")

      throw new Error(resolveExportOutsourcingReceiptPdfErrorMessage(error))
    }
  })
