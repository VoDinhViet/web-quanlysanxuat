import { z } from "zod"

import {
  EMPLOYMENT_STATUSES,
  USER_GENDERS,
} from "@/features/users/types/user.type"

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên"),
    gender: z.enum(USER_GENDERS),
    dateOfBirth: z.string().trim(),
    idNumber: z.string().trim(),
    phoneNumber: z.string().trim(),
    email: z.string().trim(),
    address: z.string().trim(),
    avatarUrl: z.string().trim(),
    departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
    positionId: z.string().trim(),
    hireDate: z.string().trim().min(1, "Vui lòng chọn ngày vào làm"),
    note: z.string().trim(),
    employmentStatus: z.enum(EMPLOYMENT_STATUSES),
    accountEnabled: z.boolean(),
    accountUsername: z.string().trim(),
    accountEmail: z.string().trim(),
    accountPassword: z.string(),
    accountConfirmPassword: z.string(),
    accountActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.email.length > 0 && !z.email().safeParse(value.email).success) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email không đúng định dạng",
      })
    }

    if (!value.accountEnabled) {
      return
    }

    if (value.accountUsername.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["accountUsername"],
        message: "Vui lòng nhập tên đăng nhập",
      })
    }

    if (!z.email().safeParse(value.accountEmail).success) {
      ctx.addIssue({
        code: "custom",
        path: ["accountEmail"],
        message: "Vui lòng nhập email đăng nhập hợp lệ",
      })
    }

    if (value.accountPassword.length < 6) {
      ctx.addIssue({
        code: "custom",
        path: ["accountPassword"],
        message: "Mật khẩu tối thiểu 6 ký tự",
      })
    }

    if (value.accountPassword !== value.accountConfirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["accountConfirmPassword"],
        message: "Mật khẩu xác nhận không khớp",
      })
    }
  })

export type CreateUserSchema = z.infer<typeof createUserSchema>
