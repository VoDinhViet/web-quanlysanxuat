import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { UPLOAD_TYPES } from "@/lib/types/file.type"
import type { ApiErrorResponse } from "@/lib/http"
import type { FileResource, UploadType } from "@/lib/types/file.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

type UploadFileInput = {
  file: File
  type: UploadType
}

function isUploadType(value: unknown): value is UploadType {
  return UPLOAD_TYPES.some((uploadType) => uploadType === value)
}

// A File can only cross the createServerFn RPC boundary inside FormData, so the
// caller packs `type` in beside it and the handler moves it to the query string
// — which is where the backend reads it, because guards run before Multer parses
// the body.
function validateUploadFormData(data: unknown): UploadFileInput {
  if (!(data instanceof FormData)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  const file = data.get("file")
  const type = data.get("type")

  if (!(file instanceof File) || !isUploadType(type)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return { file, type }
}

function resolveUploadFileErrorMessage(
  error: unknown,
  type: UploadType
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  const noun = type === "MATERIAL_DOCUMENT" ? "tài liệu" : "ảnh"

  switch (error.response?.data.errorCode) {
    case "upload.error.invalid_file":
      return `Định dạng ${noun} không hợp lệ.`
    case "upload.error.file_too_large":
      return `Kích thước ${noun} vượt quá giới hạn cho phép.`
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

/**
 * The one upload endpoint for every screen. Deliberately in `src/lib/` rather
 * than per-feature: features may not import each other, and the usual
 * "each server function owns its own error resolver" rule exists because
 * different endpoints return different codes — here there is a single endpoint
 * with a single error contract, so six copies only made it possible for one to
 * drift (the old avatar uploader was missing two branches).
 */
export const uploadFile = createServerFn({ method: "POST" })
  .validator(validateUploadFormData)
  .handler(async ({ data }): Promise<FileResource> => {
    try {
      const body = new FormData()
      body.append("file", data.file)

      const response = await http.post<FileResource>("/api/files", body, {
        params: { type: data.type },
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "uploadFile")

      throw new Error(resolveUploadFileErrorMessage(error, data.type))
    }
  })
