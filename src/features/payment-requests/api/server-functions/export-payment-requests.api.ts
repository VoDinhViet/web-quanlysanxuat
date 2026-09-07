import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { paymentRequestsSearchSchema } from "@/features/payment-requests/schemas/payment-requests-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "yeu-cau-thanh-toan.xlsx"

function resolveExportPaymentRequestsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách yêu cầu thanh toán."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportPaymentRequestsParamsSchema = paymentRequestsSearchSchema.pick({
  q: true,
  supplierId: true,
  poCode: true,
  status: true,
  startDate: true,
  endDate: true,
})

export type ExportPaymentRequestsResult = { base64: string; filename: string }

export const exportPaymentRequests = createServerFn({ method: "GET" })
  .validator(exportPaymentRequestsParamsSchema)
  .handler(async ({ data }): Promise<ExportPaymentRequestsResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/payment-requests/export",
        {
          params: data,
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
      logHttpError(error, "exportPaymentRequests")

      throw new Error(resolveExportPaymentRequestsErrorMessage(error))
    }
  })
