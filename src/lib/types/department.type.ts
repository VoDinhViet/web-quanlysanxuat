/** Mirrors the backend's department rows (GET /api/departments) — `positionCount`/
 *  `employeeCount` are the aggregate counts the list table's "Chức vụ"/"Nhân sự" columns and
 *  the detail page's stat tiles need; the backend includes them on every row, not just the
 *  single-department fetch. */
export type Department = {
  id: string
  code: string
  name: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  positionCount: number
  employeeCount: number
}

/** Mirrors the backend's department detail row (GET /api/departments/:departmentId) — same
 *  shape as the list row; kept as its own alias so call sites reading a single department stay
 *  explicit about which fetch they depend on. */
export type DepartmentDetail = Department
