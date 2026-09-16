import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { consumablesSearchSchema } from "@/features/consumables/schemas/consumables-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "vat-tu.xlsx"

function resolveExportConsumablesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportConsumablesParamsSchema = consumablesSearchSchema.pick({
  q: true,
  status: true,
  clientId: true,
})

export type ExportConsumablesResult = { base64: string; filename: string }

// `type` không nằm trong schema này — cố định "CONSUMABLE" mỗi lần gọi, mirror get-consumables.api.ts.
// Filename đọc từ `Content-Disposition` backend trả sẵn, không tự sinh lại ở FE.
export const exportConsumables = createServerFn({ method: "GET" })
  .validator(exportConsumablesParamsSchema)
  .handler(async ({ data }): Promise<ExportConsumablesResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/items/export", {
        params: { ...data, type: "CONSUMABLE" },
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
      logHttpError(error, "exportConsumables")

      throw new Error(resolveExportConsumablesErrorMessage(error))
    }
  })
