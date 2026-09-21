import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { updateUserSchema } from "@/features/users/schemas/update-user.schema"
import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import { resolveApiFileId } from "@/lib/file-field.schema"

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
    case "credential.error.username_or_email_exists":
      return "Tên đăng nhập hoặc email đăng nhập đã tồn tại."
    case "credential.error.email_exists":
      return "Email đăng nhập đã tồn tại."
    case "credential.error.password_required":
      return "Vui lòng nhập mật khẩu cho tài khoản mới."
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
export const updateUser = createServerFn({ method: "POST" })
  .validator(updateUserPayloadSchema)
  .handler(async ({ data }): Promise<void> => {
    try {
      const { userId, ...payload } = data
      await http.patch(`/api/users/${userId}`, payload)
    } catch (error) {
      logHttpError(error, "updateUser")

      throw new Error(resolveUpdateUserErrorMessage(error))
    }
  })
