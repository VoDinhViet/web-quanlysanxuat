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
const defaultExportFilename = "phieu-xuat-gia-cong-ngoai.pdf"

function resolveExportOutsourcingOrderPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "outsourcing_order.error.not_found":
      return "Không tìm thấy phiếu xuất gia công ngoài."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu xuất gia công ngoài."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportOutsourcingOrderPdfResult = {
  base64: string
  filename: string
}

export const exportOutsourcingOrderPdf = createServerFn({ method: "GET" })
  .validator(z.object({ outsourcingOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportOutsourcingOrderPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/outsourcing-orders/${data.outsourcingOrderId}/export-pdf`,
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
      logHttpError(error, "exportOutsourcingOrderPdf")

      throw new Error(resolveExportOutsourcingOrderPdfErrorMessage(error))
    }
  })
