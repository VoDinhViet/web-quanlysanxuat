import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUploadProductImageErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "upload.error.invalid_file":
      return "Định dạng ảnh không hợp lệ."
    case "upload.error.file_too_large":
      return "Kích thước ảnh vượt quá giới hạn cho phép."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function validateImageFormData(data: unknown): FormData {
  if (!(data instanceof FormData) || !(data.get("file") instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return data
}

export const uploadProductImage = createServerFn({ method: "POST" })
  .validator(validateImageFormData)
  .handler(async ({ data }): Promise<{ url: string }> => {
    try {
      const response = await http.post<{ url: string }>("/api/uploads", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      return response.data
    } catch (error) {
      logHttpError(error, "uploadProductImage")

      throw new Error(resolveUploadProductImageErrorMessage(error))
    }
  })
