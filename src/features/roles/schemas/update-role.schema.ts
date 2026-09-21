import { z } from "zod"

import { PERMISSION_CODES } from "@/lib/types/permission.type"
import { emptyToNull } from "@/lib/zod-transforms"

// Wire contract for PATCH /api/roles/:roleId — also the client-side onSubmit validator for
// UpdateRoleForm. `roleId` lives directly in the form's own state, so mutationFn receives the
// form value as-is — no manual id merge at the call site. Deliberately shares no field
// definitions with create-role.schema.ts: the two flows evolve independently.
export const updateRoleSchema = z.object({
  roleId: z.uuid(),
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã vai trò")
    .max(50, "Mã vai trò tối đa 50 ký tự"),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên vai trò")
    .max(255, "Tên vai trò tối đa 255 ký tự"),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả tối đa 500 ký tự")
    .transform(emptyToNull),
  permissions: z
    .array(z.enum(PERMISSION_CODES))
    .min(1, "Vui lòng chọn ít nhất một quyền"),
})

export type UpdateRoleSchema = z.input<typeof updateRoleSchema>

export const updateRoleFormDefaultValues: UpdateRoleSchema = {
  roleId: "",
  code: "",
  name: "",
  description: "",
  permissions: [],
}
