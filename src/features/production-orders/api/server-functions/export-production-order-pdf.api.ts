import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "lenh-san-xuat.pdf"

function resolveExportProductionOrderPdfErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "production_order.error.not_found":
      return "Không tìm thấy lệnh sản xuất."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất PDF lệnh sản xuất này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportProductionOrderPdfParamsSchema = z.object({
  productionOrderId: z.string().uuid(),
})

export type ExportProductionOrderPdfResult = { base64: string; filename: string }

export const exportProductionOrderPdf = createServerFn({ method: "GET" })
  .validator(exportProductionOrderPdfParamsSchema)
  .handler(async ({ data }): Promise<ExportProductionOrderPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/production-orders/${data.productionOrderId}/export-pdf`,
        {
          responseType: "arraybuffer",
        }
      )

      const disposition = response.headers["content-disposition"] as
        | string
        | undefined
      const filename =
        /filename="?([^"]+)"?/.exec(disposition ?? "")?.[1] ??
        defaultExportFilename

      return {
        base64: Buffer.from(response.data).toString("base64"),
        filename,
      }
    } catch (error) {
      logHttpError(error, "exportProductionOrderPdf")

      throw new Error(resolveExportProductionOrderPdfErrorMessage(error))
    }
  })
