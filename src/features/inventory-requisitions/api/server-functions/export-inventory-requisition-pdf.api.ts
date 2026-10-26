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
const defaultExportFilename = "Phieu_Lanh_Vat_Tu.pdf"

function resolveExportInventoryRequisitionPdfErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "inventory_requisition.error.not_found":
      return "Không tìm thấy phiếu lãnh vật tư."
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất phiếu lãnh vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export type ExportInventoryRequisitionPdfResult = {
  base64: string
  filename: string
}

export const exportInventoryRequisitionPdf = createServerFn({ method: "GET" })
  .validator(z.object({ requisitionId: z.uuid() }))
  .handler(async ({ data }): Promise<ExportInventoryRequisitionPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        `/api/inventory-requisitions/${data.requisitionId}/export-pdf`,
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
      logHttpError(error, "exportInventoryRequisitionPdf")

      throw new Error(resolveExportInventoryRequisitionPdfErrorMessage(error))
    }
  })
