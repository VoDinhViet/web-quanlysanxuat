import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUploadUserAvatarErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function validateAvatarFormData(data: unknown): FormData {
  if (!(data instanceof FormData) || !(data.get("file") instanceof File)) {
    throw new Error(GENERIC_ERROR_MESSAGE)
  }

  return data
}

export const uploadUserAvatar = createServerFn({ method: "POST" })
  .validator(validateAvatarFormData)
  .handler(async ({ data }): Promise<{ url: string }> => {
    try {
      const session = await useAppSession()
      const { accessToken } = session.data

      const response = await http.post<{ url: string }>(
        "/api/uploads/avatar",
        data,
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            "Content-Type": "multipart/form-data",
          },
        }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "uploadUserAvatar")

      throw new Error(resolveUploadUserAvatarErrorMessage(error))
    }
  })
