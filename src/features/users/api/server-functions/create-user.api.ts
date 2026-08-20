import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createUserSchema } from "@/features/users/schemas/create-user.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

// The form holds the whole uploaded-file object so it can render a preview; the
// backend only wants the file id.
const createUserPayloadSchema = createUserSchema.transform(
  ({ avatar, ...rest }) => ({
    ...rest,
    avatarFileId: resolveApiFileId(avatar, "create"),
  })
)

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "credential.error.username_or_email_exists":
      return "Tên đăng nhập hoặc email đăng nhập đã tồn tại."
    case "credential.error.email_exists":
      return "Email đăng nhập đã tồn tại."
    case "user.error.id_number_exists":
      return "Số CCCD/CMND đã tồn tại."
    case "department.error.not_found":
      return "Phòng ban không còn tồn tại. Vui lòng chọn lại."
    case "position.error.not_found":
      return "Chức vụ không còn tồn tại. Vui lòng chọn lại."
    case "position.error.department_mismatch":
      return "Chức vụ không thuộc phòng ban đã chọn."
    case "role.error.not_found":
      return "Vai trò không còn tồn tại. Vui lòng chọn lại."
    case "role.error.elevation_forbidden":
      return "Bạn không thể gán vai trò có quyền cao hơn quyền của mình."
    case "file.error.not_found":
      return "File đính kèm không còn tồn tại. Vui lòng tải lên lại."
    case "auth.error.forbidden":
      return "Bạn không có quyền thực hiện thao tác này."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

// BE trả 204 No Content.
export const createUser = createServerFn({ method: "POST" })
  .validator(createUserPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      await http.post("/api/users", data)
    } catch (error) {
      logHttpError(error, "createUser")

      throw new Error(resolveCreateUserErrorMessage(error))
    }
  })
