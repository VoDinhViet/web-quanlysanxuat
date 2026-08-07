import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  optionalEmail,
  toIsoDate,
} from "@/lib/zod-transforms"

// Wire contract for the `credential` field of POST /api/users — creating an employee
// always provisions a brand-new account, so the password is required. Not .trim(): leading/
// trailing whitespace could be intentional, unlike the other optional fields below.
export const createCredentialSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  email: z.email("Vui lòng nhập email đăng nhập hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  roleId: z.string().trim().min(1, "Vui lòng chọn vai trò"),
})

// Wire contract for POST /api/users — also the client-side onSubmit validator for
// CreateUserForm. Every optional field transforms "" straight to undefined here, so the
// parsed value is already wire-ready — no separate mapping step. Deliberately shares no
// field definitions with update-user.schema.ts: the two flows evolve independently.
export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(255, "Họ và tên tối đa 255 ký tự"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().trim().transform(emptyToUndefinedIsoDate),
  idNumber: z
    .string()
    .trim()
    .max(20, "Số CCCD/CMND tối đa 20 ký tự")
    .transform(emptyToUndefined),
  phoneNumber: z
    .string()
    .trim()
    .max(30, "Số điện thoại tối đa 30 ký tự")
    .transform(emptyToUndefined),
  email: optionalEmail(),
  address: z
    .string()
    .trim()
    .max(500, "Địa chỉ tối đa 500 ký tự")
    .transform(emptyToUndefined),
  avatar: imageFieldSchema,
  departmentId: z.string().trim().min(1, "Vui lòng chọn phòng ban"),
  positionId: z.string().trim().min(1, "Vui lòng chọn chức vụ"),
  hireDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày vào làm")
    .transform(toIsoDate),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(["WORKING", "RESIGNED"]),
  credential: createCredentialSchema.optional(),
})

export type CreateUserSchema = z.input<typeof createUserSchema>

export const createUserFormDefaultValues: CreateUserSchema = {
  fullName: "",
  gender: "MALE",
  dateOfBirth: "",
  idNumber: "",
  phoneNumber: "",
  email: "",
  address: "",
  avatar: null,
  departmentId: "",
  positionId: "",
  hireDate: "",
  note: "",
  status: "WORKING",
  credential: undefined,
}
