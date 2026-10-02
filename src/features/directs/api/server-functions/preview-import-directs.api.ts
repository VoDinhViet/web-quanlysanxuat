import { createServerFn } from "@tanstack/react-start"

import {
  IMPORT_MAX_ROWS,
  importTemplateHeaders,
} from "@/features/directs/constants/import-direct-template"
import { logHttpError } from "@/lib/http"
import { directImportFields } from "@/lib/types/direct.type"
import type {
  DirectImportKey,
  DirectImportPreviewRow,
} from "@/lib/types/direct.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const INVALID_FILE_MESSAGE = `File không hợp lệ: cần dùng file Excel (.xlsx) theo đúng file mẫu, có dữ liệu và tối đa ${IMPORT_MAX_ROWS} dòng.`

// A File can only cross the createServerFn RPC boundary inside FormData.
function validatePreviewFormData(data: unknown): { file: File } {
  const file = data instanceof FormData ? data.get("file") : null
  if (!(file instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return { file }
}

// Reads the first sheet into editable rows without touching the backend; unit/supplier/client
// codes and duplicates are only checked by the backend when the rows are imported.
async function readPreviewRows(file: File): Promise<DirectImportPreviewRow[]> {
  const { default: exceljs } = await import("exceljs")
  const { Workbook } = exceljs
  const workbook = new Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const worksheet = workbook.worksheets[0]
  const headerRow = worksheet.getRow(1)
  const hasMatchingHeader = importTemplateHeaders.every(
    (header, index) => headerRow.getCell(index + 1).text.trim() === header
  )
  if (!hasMatchingHeader) {
    throw new Error(INVALID_FILE_MESSAGE)
  }

  const rows: DirectImportPreviewRow[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const values = Object.fromEntries(
      directImportFields.map(({ key }, index) => [
        key,
        row.getCell(index + 1).text.trim(),
      ])
    ) as Record<DirectImportKey, string>
    // `as`: Object.fromEntries widens the keys to string; the field list covers every key.

    if (Object.values(values).some((value) => value !== "")) {
      rows.push({ rowNumber, values })
    }
  })

  if (rows.length === 0 || rows.length > IMPORT_MAX_ROWS) {
    throw new Error(INVALID_FILE_MESSAGE)
  }

  return rows
}

export const previewImportDirects = createServerFn({ method: "POST" })
  .validator(validatePreviewFormData)
  .handler(async ({ data }): Promise<DirectImportPreviewRow[]> => {
    try {
      return await readPreviewRows(data.file)
    } catch (error) {
      // exceljs rejects a non-xlsx/corrupt file with a plain Error, so every failure here means "invalid file".
      logHttpError(error, "previewImportDirects")

      throw new Error(INVALID_FILE_MESSAGE)
    }
  })
