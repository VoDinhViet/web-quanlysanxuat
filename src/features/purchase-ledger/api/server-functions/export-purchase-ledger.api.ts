import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { purchaseLedgerSearchSchema } from "@/features/purchase-ledger/schemas/purchase-ledger-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "so-cai-mua-hang.xlsx"

function resolveExportPurchaseLedgerErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel sổ cái mua hàng."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

const exportPurchaseLedgerParamsSchema = purchaseLedgerSearchSchema.pick({
  q: true,
  status: true,
  createdStartDate: true,
  createdEndDate: true,
  neededStartDate: true,
  neededEndDate: true,
})

export type ExportPurchaseLedgerResult = { base64: string; filename: string }

export const exportPurchaseLedger = createServerFn({ method: "GET" })
  .validator(exportPurchaseLedgerParamsSchema)
  .handler(async ({ data }): Promise<ExportPurchaseLedgerResult> => {
    try {
      const response = await http.get<ArrayBuffer>(
        "/api/purchase-ledger/export",
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
      logHttpError(error, "exportPurchaseLedger")

      throw new Error(resolveExportPurchaseLedgerErrorMessage(error))
    }
  })
