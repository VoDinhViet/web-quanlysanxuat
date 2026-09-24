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
const defaultExportFilename = "Ke_Hoach_San_Xuat.pdf"

function resolveExportProductionJobsPlanPdfErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất biểu mẫu kế hoạch sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportProductionJobsPlanPdfParamsSchema = z.object({
  jobIds: z.array(z.uuid()).min(1),
})

export type ExportProductionJobsPlanPdfResult = {
  base64: string
  filename: string
}

export const exportProductionJobsPlanPdf = createServerFn({ method: "GET" })
  .validator(exportProductionJobsPlanPdfParamsSchema)
  .handler(async ({ data }): Promise<ExportProductionJobsPlanPdfResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/production-jobs/export-plan-pdf",
        {
          params: { jobIds: data.jobIds.join(",") },
          responseType: "arraybuffer",
        }
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
      logHttpError(error, "exportProductionJobsPlanPdf")

      throw new Error(resolveExportProductionJobsPlanPdfErrorMessage(error))
    }
  })
