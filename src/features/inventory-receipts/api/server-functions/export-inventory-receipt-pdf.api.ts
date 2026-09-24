import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import {
  arrayBufferToBase64,
  getFilenameFromContentDisposition,
} from "@/lib/export.util"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "Phieu_Nhap_Kho.pdf"

function resolveExportInventoryReceiptPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_document.error.not_found":
      return "Không tìm thấy phiếu nhập kho."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu nhập kho."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportInventoryReceiptPdfResult = {
  base64: string
  filename: string
}

export const exportInventoryReceiptPdf = createServerFn({ method: "GET" })
  .validator(z.object({ receiptId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportInventoryReceiptPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/inventory-receipts/${data.receiptId}/export-pdf`,
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
      logHttpError(error, "exportInventoryReceiptPdf")

      throw new Error(resolveExportInventoryReceiptPdfErrorMessage(error))
    }
  })
