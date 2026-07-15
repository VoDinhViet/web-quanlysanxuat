import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { createUserSchema } from "@/features/users/schemas/create-user.schema"
import { http, logHttpError } from "@/lib/http"
import { useAppSession } from "@/lib/session"
import type { ApiErrorResponse } from "@/lib/http"
import type { CreateUserSchema } from "@/features/users/schemas/create-user.schema"
import type { User } from "@/features/users/types/user.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveCreateUserErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    case "user.error.username_or_email_exists":
      return "Tên đăng nhập hoặc email đã tồn tại."
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

function toOptional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function buildCreateUserRequestBody(data: CreateUserSchema) {
  return {
    fullName: data.fullName,
    gender: data.gender,
    dateOfBirth: toOptional(data.dateOfBirth),
    idNumber: toOptional(data.idNumber),
    phoneNumber: toOptional(data.phoneNumber),
    email: toOptional(data.email),
    address: toOptional(data.address),
    avatarUrl: toOptional(data.avatarUrl),
    departmentId: data.departmentId,
    positionId: toOptional(data.positionId),
    hireDate: data.hireDate,
    note: toOptional(data.note),
    employmentStatus: data.employmentStatus,
    account: data.accountEnabled
      ? {
          username: data.accountUsername,
          email: data.accountEmail,
          password: data.accountPassword,
          isActive: data.accountActive,
        }
      : undefined,
  }
}

export const createUser = createServerFn({ method: "POST" })
  .validator(createUserSchema)
  .handler(async ({ data }): Promise<User> => {
    try {
      const session = await useAppSession()
      const { accessToken } = session.data

      const response = await http.post<User>(
        "/api/users",
        buildCreateUserRequestBody(data),
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        }
      )

      return response.data
    } catch (error) {
      logHttpError(error, "createUser")

      throw new Error(resolveCreateUserErrorMessage(error))
    }
  })
