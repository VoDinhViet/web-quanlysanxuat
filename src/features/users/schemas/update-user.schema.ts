import { z } from "zod"

import { imageFieldSchema } from "@/lib/file-field.schema"
import {
  emptyToUndefined,
  emptyToUndefinedIsoDate,
  optionalEmail,
  toIsoDate,
} from "@/lib/zod-transforms"

import { EmployeeStatus, UserGender } from "@/lib/types/user.type"

// Wire contract for the `credential` field of PATCH /api/users/:userId. `credentialId` is
// UI-only: present means the employee already has an ERP account, so the password may be
// left blank (blank = keep the current password). The object transform below strips it
// from the payload, same as orderItemFormSchema strips productLabel/productUnit
// (orders/schemas/order-item-form.schema.ts). Password is not .trim(): leading/trailing
// whitespace could be intentional, unlike the other optional fields below.
export const updateCredentialSchema = z
  .object({
    credentialId: z.string().optional(),
    username: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập"),
    email: z.email("Vui lòng nhập email đăng nhập hợp lệ"),
    password: z
      .string()
      .refine(
        (value) => value.length === 0 || value.length >= 6,
        "Mật khẩu tối thiểu 6 ký tự"
      )
      .transform(emptyToUndefined),
    roleId: z.string().trim().min(1, "Vui lòng chọn vai trò"),
  })
  .superRefine(({ credentialId, password }, ctx) => {
    if (!credentialId && !password) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Vui lòng nhập mật khẩu",
      })
    }
  })
  .transform(({ credentialId, ...credential }) => credential)

// Wire contract for PATCH /api/users/:userId — also the client-side onSubmit validator for
// UpdateUserForm. `userId` lives directly in the form's own state (the update flow's
// sections are its own components, not shared with CreateUserForm, so there's no
// withForm-invariance conflict), so mutationFn receives the form value as-is — no manual
// id merge at the call site. Deliberately shares no field definitions with
// create-user.schema.ts: the two flows evolve independently.
export const updateUserSchema = z.object({
  userId: z.uuid(),
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên")
    .max(255, "Họ và tên tối đa 255 ký tự"),
  gender: z.enum(UserGender),
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
  status: z.enum(EmployeeStatus),
  credential: updateCredentialSchema.optional(),
})

export type UpdateUserSchema = z.input<typeof updateUserSchema>

// Only used for withForm's type inference in the update flow's own sections — the real
// values always come from UpdateUserForm's own `defaultValues`, so `userId: ""` here is
// harmless.
export const updateUserFormDefaultValues: UpdateUserSchema = {
  userId: "",
  fullName: "",
  gender: UserGender.MALE,
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
