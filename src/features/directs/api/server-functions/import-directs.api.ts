import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import {
  IMPORT_MAX_ROWS,
  importTemplateHeaders,
} from "@/features/directs/constants/import-direct-template"
import { importDirectsSchema } from "@/features/directs/schemas/import-direct-row.schema"
import type { ImportDirectsInput } from "@/features/directs/schemas/import-direct-row.schema"
import { XLSX_MIME_TYPE } from "@/lib/download-file"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { directImportFields } from "@/lib/types/direct.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
// Hiển thị tối đa số lỗi này; phần còn lại gộp thành một dòng "và N lỗi khác".
const MAX_LISTED_ERRORS = 15

function resolveImportDirectsErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  const body = error.response?.data

  switch (body?.errorCode) {
    case "item.error.import_file_invalid":
      return `File không hợp lệ: cần dùng file Excel (.xlsx) theo đúng file mẫu, có dữ liệu và tối đa ${IMPORT_MAX_ROWS} dòng.`
    case "item.error.import_rows_invalid": {
      // `details` là danh sách lỗi theo dòng, backend đã sắp theo số dòng.
      const details = body.details ?? []
      const listed = details
        .slice(0, MAX_LISTED_ERRORS)
        .map((detail) => `${detail.property}: ${detail.message}`)
      const rest = details.length - listed.length
      if (rest > 0) listed.push(`... và ${rest} lỗi khác`)

      return [
        `File có ${details.length} lỗi, chưa có vật tư nào được nhập:`,
        ...listed,
      ].join("\n")
    }
    case "item.error.code_exists":
      return "Có mã vật tư vừa được tạo trùng, vui lòng thử lại."
    case "upload.error.file_too_large":
      return "File vượt quá 5MB."
    case "auth.error.forbidden":
      return "Bạn không có quyền nhập vật tư."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Rebuilds an .xlsx from the edited rows (kept at their original row numbers, so the backend's
// "Dòng N" errors still point at the line the user saw) and posts it to the existing file import.
async function buildImportFile(
  rows: ImportDirectsInput["rows"]
): Promise<File> {
  const { default: exceljs } = await import("exceljs")
  const { Workbook } = exceljs
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet("Vật tư")
  worksheet.getRow(1).values = importTemplateHeaders

  for (const { rowNumber, ...cells } of rows) {
    worksheet.getRow(rowNumber).values = directImportFields.map(
      ({ key }) => cells[key] ?? ""
    )
  }

  return new File([await workbook.xlsx.writeBuffer()], "nhap-vat-tu.xlsx", {
    type: XLSX_MIME_TYPE,
  })
}

// POST /api/items/import — backend returns 204, the caller invalidates ["directs"].
export const importDirects = createServerFn({ method: "POST" })
  .validator(importDirectsSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const body = new FormData()
      body.append("file", await buildImportFile(data.rows))

      await http.post("/api/items/import", body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    } catch (error) {
      logHttpError(error, "importDirects")

      throw new Error(resolveImportDirectsErrorMessage(error))
    }
  })
