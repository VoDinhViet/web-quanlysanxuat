import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import { z } from "zod"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "danh-sach-don-hang.xlsx"

function resolveExportOrdersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách đơn hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportOrdersExcelParamsSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1),
})

export type ExportOrdersExcelResult = {
  base64: string
  filename: string
}

export const exportOrdersExcel = createServerFn({ method: "GET" })
  .validator(exportOrdersExcelParamsSchema)
  .handler(async ({ data }): Promise<ExportOrdersExcelResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/orders/export-excel", {
        params: {
          orderIds: data.orderIds.join(","),
        },
        responseType: "arraybuffer",
      })

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
      logHttpError(error, "exportOrdersExcel")

      throw new Error(resolveExportOrdersErrorMessage(error))
    }
  })
