import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { usersSearchSchema } from "@/features/users/schemas/users-search.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."
const defaultExportFilename = "nhan-su.xlsx"

function resolveExportUsersErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "auth.error.forbidden":
      return "Bạn không có quyền xuất Excel danh sách nhân sự."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// Backend (`ExportUsersReqDto`) chỉ nhận `q` — bỏ page/limit/status/order khỏi bộ lọc URL hiện có,
// giữ đúng khuôn `.pick()` từ cùng schema danh sách như `get-users.api.ts` dùng.
const exportUsersParamsSchema = usersSearchSchema.pick({ q: true })

export type ExportUsersResult = { base64: string; filename: string }

// `responseType: "arraybuffer"` vì server function chạy Node, không có Blob của DOM — decode
// base64 thành Blob ở client qua `downloadBase64File`. Filename đọc từ `Content-Disposition` backend
// trả sẵn, không tự sinh lại ở FE để khỏi lệch định dạng với BE.
export const exportUsers = createServerFn({ method: "GET" })
  .validator(exportUsersParamsSchema)
  .handler(async ({ data }): Promise<ExportUsersResult> => {
    try {
      const response = await http.get<ArrayBuffer>("/api/users/export", {
        params: data,
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
      logHttpError(error, "exportUsers")

      throw new Error(resolveExportUsersErrorMessage(error))
    }
  })
