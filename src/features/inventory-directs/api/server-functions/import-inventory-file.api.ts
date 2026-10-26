import { createServerFn } from "@tanstack/react-start"
import axios from "axios"
import type { Cell } from "exceljs"
import { DateTime } from "luxon"

import {
  INVENTORY_IMPORT_MAX_FILE_BYTES,
  INVENTORY_IMPORT_MAX_ROWS,
  inventoryImportHeaders,
} from "@/features/inventory-directs/constants/inventory-import-template"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { InventoryImportResult } from "@/lib/types/inventory-direct.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const INVALID_FILE_MESSAGE =
  'File không hợp lệ: cần dùng file Excel (.xlsx) tải từ nút "Tải file mẫu", giữ nguyên dòng tiêu đề.'
// Hiển thị tối đa số lỗi này; phần còn lại gộp thành một dòng "và N lỗi khác".
const MAX_LISTED_ERRORS = 15

type InventoryImportRow = {
  rowNumber: number
  itemCode?: string
  revision?: string
  actualQuantity: string
  note?: string
}

class ImportFileError extends Error {}

// A File can only cross the createServerFn RPC boundary inside FormData.
// Dropzone chặn sẵn ở client, kiểm lại ở đây vì server fn gọi thẳng được mà không qua dropzone.
function validateImportFormData(formData: unknown): { file: File } {
  const file = formData instanceof FormData ? formData.get("file") : null
  if (!(file instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }
  if (
    file.size > INVENTORY_IMPORT_MAX_FILE_BYTES ||
    !file.name.toLowerCase().endsWith(".xlsx")
  ) {
    throw new Error(INVALID_FILE_MESSAGE)
  }

  return { file }
}

// Ô số giữ nguyên giá trị gốc thay vì `cell.text` — `text` theo định dạng ô có thể chèn dấu phân
// cách hàng nghìn mà BE không nhận.
function readQuantityCell(cell: Cell): string {
  return typeof cell.value === "number" ? String(cell.value) : cell.text.trim()
}

async function readInventoryImportRows(
  file: File
): Promise<InventoryImportRow[]> {
  const { default: exceljs } = await import("exceljs")
  const workbook = new exceljs.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())

  const worksheet = workbook.worksheets.at(0)
  const headerRow = worksheet?.getRow(1)
  const hasMatchingHeader = inventoryImportHeaders.every(
    (header, index) => headerRow?.getCell(index + 1).text.trim() === header
  )
  if (!worksheet || !hasMatchingHeader) {
    throw new ImportFileError(INVALID_FILE_MESSAGE)
  }

  const importRows: InventoryImportRow[] = []
  worksheet.eachRow((sheetRow, rowNumber) => {
    if (rowNumber === 1) return

    // Dòng để trống "Tồn thực tế" là vật tư chưa kiểm, bỏ qua thay vì hiểu thành tồn 0.
    const actualQuantity = readQuantityCell(sheetRow.getCell(6))
    if (actualQuantity === "") return

    // Ô trống gửi `undefined`: field tuỳ chọn của BE từ chối chuỗi rỗng.
    importRows.push({
      rowNumber,
      itemCode: sheetRow.getCell(1).text.trim() || undefined,
      revision: sheetRow.getCell(2).text.trim() || undefined,
      actualQuantity,
      note: sheetRow.getCell(7).text.trim() || undefined,
    })
  })

  if (importRows.length === 0) {
    throw new ImportFileError('File chưa có dòng nào điền cột "Tồn thực tế".')
  }
  if (importRows.length > INVENTORY_IMPORT_MAX_ROWS) {
    throw new ImportFileError(
      `Tối đa ${INVENTORY_IMPORT_MAX_ROWS} dòng có "Tồn thực tế" mỗi lần nhập, hãy chia file.`
    )
  }

  return importRows
}

function resolveImportInventoryErrorMessage(error: unknown): string {
  if (error instanceof ImportFileError) return error.message
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    // exceljs rejects a non-xlsx/corrupt file with a plain Error.
    return INVALID_FILE_MESSAGE
  }

  const body = error.response?.data

  switch (body?.errorCode) {
    case "inventory_direct_import.error.rows_invalid": {
      // `details` là lỗi theo dòng, backend đã sắp theo số dòng; rỗng khi lỗi là vượt số dòng.
      // Cùng ngoại lệ với `import-directs.api.ts`: lời lỗi từng dòng do BE viết sẵn tiếng Việt.
      const details = body.details ?? []
      if (details.length === 0) {
        return `Tối đa ${INVENTORY_IMPORT_MAX_ROWS} dòng mỗi lần nhập.`
      }

      const listed = details
        .slice(0, MAX_LISTED_ERRORS)
        .map((detail) => `${detail.property}: ${detail.message}`)
      const rest = details.length - listed.length
      if (rest > 0) listed.push(`... và ${rest} lỗi khác`)

      return [
        "File còn dòng lỗi, chưa ghi sổ dòng nào. Sửa file rồi nhập lại:",
        ...listed,
      ].join("\n")
    }
    case "auth.error.forbidden":
      return "Bạn không có quyền nhập tồn kho từ Excel."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Đọc file ở server fn rồi POST /api/inventory-directs/import — BE kiểm từng dòng, sinh phiếu điều
// chỉnh kiểm kê và ghi sổ ngay. Caller invalidate các query đọc tồn.
export const importInventoryFile = createServerFn({ method: "POST" })
  .validator(validateImportFormData)
  .handler(async ({ data }): Promise<InventoryImportResult> => {
    try {
      const importRows = await readInventoryImportRows(data.file)
      const response = await http.post<InventoryImportResult>(
        "/api/inventory-directs/import",
        {
          rows: importRows,
          adjustmentDate: DateTime.now()
            .setZone("Asia/Ho_Chi_Minh")
            .toISODate(),
          note: "Nhập tồn kho từ Excel",
        }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "importInventoryFile")

      throw new Error(resolveImportInventoryErrorMessage(error))
    }
  })
