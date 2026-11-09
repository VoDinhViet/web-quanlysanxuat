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
const defaultExportFilename = "phieu-giao-hang.pdf"

function resolveExportOutboundOrderPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outbound_order.error.not_found":
      return "Không tìm thấy phiếu giao hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportOutboundOrderPdfResult = {
  base64: string
  filename: string
}

export const exportOutboundOrderPdf = createServerFn({ method: "GET" })
  .validator(z.object({ outboundOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportOutboundOrderPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/outbound-orders/${data.outboundOrderId}/export-pdf`,
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
      logHttpError(error, "exportOutboundOrderPdf")

      throw new Error(resolveExportOutboundOrderPdfErrorMessage(error))
    }
  })
