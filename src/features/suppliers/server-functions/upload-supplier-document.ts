import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUploadSupplierDocumentErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "upload.error.invalid_file":
      return "Định dạng file không hợp lệ."
    case "upload.error.file_too_large":
      return "Kích thước file vượt quá giới hạn cho phép."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function validateDocumentFormData(data: unknown): FormData {
  if (!(data instanceof FormData) || !(data.get("file") instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return data
}

export type UploadedDocument = {
  url: string
  filename: string
  mimetype: string
  size: number
}

export const uploadSupplierDocument = createServerFn({ method: "POST" })
  .validator(validateDocumentFormData)
  .handler(async ({ data }): Promise<UploadedDocument> => {
    try {
      const response = await http.post<UploadedDocument>(
        "/api/uploads/document",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "uploadSupplierDocument")

      throw new Error(resolveUploadSupplierDocumentErrorMessage(error))
    }
  })
