import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateUserSchema } from "@/features/users/schemas/update-user.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"
import type { User } from "@/lib/types/user.type"

// `avatar` carries a display URL the backend has no field for — only the file id
// goes on the wire. PATCH treats a missing key as "no change", so an explicitly
// cleared avatar is sent as null.
const updateUserPayloadSchema = updateUserSchema.transform(
  ({ avatar, ...rest }) => ({
    ...rest,
    avatarFileId: resolveApiFileId(avatar, "update"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveUpdateUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "user.error.not_found":
      return "Không tìm thấy nhân viên."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const updateUser = createServerFn({ method: "POST" })
  .validator(updateUserPayloadSchema)
  .handler(async ({ data }): Promise<User> => {
    try {
      const { userId, ...payload } = data
      const response = await http.patch<User>(`/api/users/${userId}`, payload)

      return response.data
    } catch (error) {
      logHttpError(error, "updateUser")

      throw new Error(resolveUpdateUserErrorMessage(error))
    }
  })
