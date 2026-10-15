import { z } from "zod"

import type { PermissionCode } from "@/lib/types/permission.type"
import { emptyToUndefined } from "@/lib/zod-transforms"

// Wire contract for POST /api/roles — also the client-side onSubmit validator for
// CreateRoleForm. Deliberately shares no field definitions with update-role.schema.ts: the two
// flows evolve independently.
export const createRoleSchema = z.object({
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
    .transform(emptyToUndefined),
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

export type CreateRoleSchema = z.input<typeof createRoleSchema>

export const createRoleFormDefaultValues: CreateRoleSchema = {
  code: "",
  name: "",
  description: "",
  permissions: [],
}
