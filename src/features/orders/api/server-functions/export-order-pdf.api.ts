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
const defaultExportFilename = "BM01_KD_Don_Hang.pdf"

function resolveExportOrderPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng."
    case "purchase_order.error.pdf_render_failed":
      return "Không tạo được file PDF biểu mẫu đơn hàng. Vui lòng thử lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất biểu mẫu đơn hàng này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportOrderPdfParamsSchema = z.object({
  orderId: z.uuid(),
})

export type ExportOrderPdfResult = { base64: string; filename: string }

export const exportOrderPdf = createServerFn({ method: "GET" })
  .validator(exportOrderPdfParamsSchema)
  .handler(async ({ data }): Promise<ExportOrderPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/orders/${data.orderId}/export-pdf`,
        { responseType: "arraybuffer" }
      )

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined
      const filename = getFilenameFromContentDisposition(
        disposition,
        defaultExportFilename
      )

      return {
        base64: arrayBufferToBase64(response.data),
        filename,
      }
    } catch (error) {
      logHttpError(error, "exportOrderPdf")

      throw new Error(resolveExportOrderPdfErrorMessage(error))
    }
  })
