/** Mirrors the backend's RoleResDto (GET /roles, GET /roles/:id, POST /roles, PATCH /roles/:id). */
export type Role = {
  id: string
  code: string
  name: string
  description: string | null
  permissions: string[]
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

/** Lightweight role reference nested in other entities (mirrors the backend's RoleRefResDto) —
 *  e.g. the role assigned to a user's ERP credential. */
export type RoleRef = Pick<Role, "id" | "code" | "name">
