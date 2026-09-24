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
const defaultExportFilename = "BM03_KD_DS_Tong_Hop_Don_Hang.pdf"

function resolveExportOrdersSummaryPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "order.error.not_found":
      return "Không tìm thấy đơn hàng đã chọn."
    case "purchase_order.error.pdf_render_failed":
      return "Không tạo được file PDF biểu mẫu tổng hợp. Vui lòng thử lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất biểu mẫu tổng hợp đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportOrdersSummaryPdfParamsSchema = z.object({
  orderIds: z.array(z.uuid()).min(1),
})

export type ExportOrdersSummaryPdfResult = {
  base64: string
  filename: string
}

export const exportOrdersSummaryPdf = createServerFn({ method: "GET" })
  .validator(exportOrdersSummaryPdfParamsSchema)
  .handler(async ({ data }): Promise<ExportOrdersSummaryPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/orders/export-summary-pdf",
        {
          params: {
            orderIds: data.orderIds.join(","),
          },
          responseType: "arraybuffer",
        }
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
      logHttpError(error, "exportOrdersSummaryPdf")

      throw new Error(resolveExportOrdersSummaryPdfErrorMessage(error))
    }
  })
