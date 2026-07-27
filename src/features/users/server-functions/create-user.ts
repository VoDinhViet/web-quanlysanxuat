import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createUserSchema } from "@/features/users/schemas/create-user.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveFileFieldId } from "@/lib/file-field.schema"
import type { User } from "@/lib/types/user.type"

// The form holds the whole uploaded-file object so it can render a preview; the
// backend only wants the file id.
const createUserPayloadSchema = createUserSchema.transform(
  ({ avatar, ...rest }) => ({
    ...rest,
    avatarFileId: resolveFileFieldId(avatar, "create"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "user.error.username_or_email_exists":
      return "Tên đăng nhập hoặc email đã tồn tại."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const createUser = createServerFn({ method: "POST" })
  .validator(createUserPayloadSchema)
  .handler(async ({ data }): Promise<User> => {
    try {
      const response = await http.post<User>("/api/users", data)

      return response.data
    } catch (error) {
      logHttpError(error, "createUser")

      throw new Error(resolveCreateUserErrorMessage(error))
    }
  })
