import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { productionOrdersSearchSchema } from "@/features/production-orders/schemas/production-orders-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "lenh-san-xuat.xlsx"

function resolveExportProductionOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách lệnh sản xuất."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// `dueDateFrom`/`dueDateTo` rename to `startDate`/`endDate` — same rename as
// `get-production-orders.api.ts`, ExportProductionOrdersReqDto uses the backend's shared
// `startDate`/`endDate` filter naming, not the URL's own param names.
const exportProductionOrdersParamsSchema = productionOrdersSearchSchema
  .pick({ q: true, status: true, dueDateFrom: true, dueDateTo: true })
  .transform(({ dueDateFrom, dueDateTo, ...rest }) => ({
    ...rest,
    startDate: dueDateFrom,
    endDate: dueDateTo,
  }))

export type ExportProductionOrdersResult = { base64: string; filename: string }

export const exportProductionOrders = createServerFn({ method: "GET" })
  .validator(exportProductionOrdersParamsSchema)
  .handler(async ({ data }): Promise<ExportProductionOrdersResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/production-orders/export",
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
      logHttpError(error, "exportProductionOrders")

      throw new Error(resolveExportProductionOrdersErrorMessage(error))
    }
  })
