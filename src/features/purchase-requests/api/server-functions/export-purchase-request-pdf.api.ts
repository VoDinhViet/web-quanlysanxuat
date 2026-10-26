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
const defaultExportFilename = "De_Xuat_Mua_Hang.pdf"

function resolveExportPurchaseRequestPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "purchase_request.error.not_found":
      return "Không tìm thấy đề xuất mua hàng."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất đề xuất mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportPurchaseRequestPdfResult = {
  base64: string
  filename: string
}

export const exportPurchaseRequestPdf = createServerFn({ method: "GET" })
  .validator(z.object({ purchaseRequestId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportPurchaseRequestPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/purchase-requests/${data.purchaseRequestId}/export-pdf`,
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
      logHttpError(error, "exportPurchaseRequestPdf")

      throw new Error(resolveExportPurchaseRequestPdfErrorMessage(error))
    }
  })
