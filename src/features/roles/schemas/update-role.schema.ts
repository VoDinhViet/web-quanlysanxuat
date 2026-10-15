import { z } from "zod"

import type { PermissionCode } from "@/lib/types/permission.type"
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
  // Không dùng z.enum(PERMISSION_CODES): BE là nguồn sự thật (E031 khi mã sai), nên mã quyền mới
  // thêm ở BE tick được ngay mà không phải đồng bộ danh sách này trước.
  permissions: z
    .array(
      z.custom<PermissionCode>(
        (value) => typeof value === "string" && value.length > 0
      )
    )
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
