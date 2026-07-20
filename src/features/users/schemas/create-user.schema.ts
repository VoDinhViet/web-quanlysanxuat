import { DateTime } from "luxon"
import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"

import { EmployeeStatus, USER_GENDERS } from "@/features/users/types/user.type"

// Wire contract for POST /api/users' `credential` field — matches the backend's
// CreateCredentialReqDto.
export const createCredentialSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  email: z.email("Vui lòng nhập email đăng nhập hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  roleId: z.string().trim().min(1, "Vui lòng chọn vai trò"),
})

// Wire contract for the `credential` field when updating an employee who
// already has an ERP account — password is left blank to keep it unchanged.
export const updateCredentialSchema = z.object({
  username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
  email: z.email("Vui lòng nhập email đăng nhập hợp lệ"),
  password: z
    .string()
    .refine((value) => value.length === 0 || value.length >= 6, {
      message: "Mật khẩu tối thiểu 6 ký tự",
    }),
  roleId: z.string().trim().min(1, "Vui lòng chọn vai trò"),
})

// A blank form input means "not provided" — the wire payload should omit the
// field rather than send an empty string.
function emptyToUndefined(value: string): string | undefined {
  return value.length > 0 ? value : undefined
}

// Raw form fields shared by the create and update user schemas. Optional
// fields transform "" straight to undefined here, so every schema built from
// this object gets wire-ready values for free — no separate mapping step.
export const userProfileFields = {
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(255, "Họ và tên tối đa 255 ký tự"),
  gender: z.enum(USER_GENDERS),
  dateOfBirth: z
    .string()
    .trim()
    .transform((value) =>
      value.length > 0
        ? DateTime.fromISO(value).toJSDate().toISOString()
        : undefined
    ),
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
  email: z.string().trim().transform(emptyToUndefined),
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
    .transform((value) => DateTime.fromISO(value).toJSDate().toISOString()),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .transform(emptyToUndefined),
  status: z.enum(EmployeeStatus),
}

// The personal email is optional, so it only needs a format check when filled
// (email is already transformed to undefined-when-empty by userProfileFields
// by the time this runs).
export function refinePersonalEmail(
  value: { email?: string },
  ctx: z.RefinementCtx
): void {
  if (value.email && !z.email().safeParse(value.email).success) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Email không đúng định dạng",
    })
  }
}

export const createUserSchema = z
  .object({
    ...userProfileFields,
    credential: createCredentialSchema.optional(),
  })
  .superRefine(refinePersonalEmail)

// Raw form-field shape — used for defaultValues/form typing.
export type CreateUserSchema = z.input<typeof createUserSchema>

export const CREATE_USER_DEFAULT_VALUES: CreateUserSchema = {
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
  status: EmployeeStatus.WORKING,
  credential: undefined,
}
