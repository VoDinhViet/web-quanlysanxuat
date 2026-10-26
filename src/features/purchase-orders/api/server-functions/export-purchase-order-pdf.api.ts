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
const defaultExportFilename = "Don_Dat_Hang.pdf"

function resolveExportPurchaseOrderPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_order.error.not_found":
      return "Không tìm thấy đơn đặt hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất đơn đặt hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportPurchaseOrderPdfResult = {
  base64: string
  filename: string
}

export const exportPurchaseOrderPdf = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseOrderId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportPurchaseOrderPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/purchase-orders/${data.purchaseOrderId}/export-pdf`,
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
      logHttpError(error, "exportPurchaseOrderPdf")

      throw new Error(resolveExportPurchaseOrderPdfErrorMessage(error))
    }
  })
