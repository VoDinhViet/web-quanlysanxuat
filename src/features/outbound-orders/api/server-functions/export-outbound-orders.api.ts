import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { outboundOrdersSearchSchema } from "@/features/outbound-orders/schemas/outbound-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "don-giao-hang.xlsx"

function resolveExportOutboundOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách đơn giao hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportOutboundOrdersParamsSchema = outboundOrdersSearchSchema.pick({
  q: true,
  clientId: true,
  status: true,
  fulfillmentType: true,
  startDate: true,
  endDate: true,
})

export type ExportOutboundOrdersResult = { base64: string; filename: string }

export const exportOutboundOrders = createServerFn({ method: "GET" })
  .validator(exportOutboundOrdersParamsSchema)
  .handler(async ({ data }): Promise<ExportOutboundOrdersResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/outbound-orders/export",
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
      logHttpError(error, "exportOutboundOrders")

      throw new Error(resolveExportOutboundOrdersErrorMessage(error))
    }
  })
