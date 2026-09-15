import type { Department } from "@/lib/types/department.type"

/** Mirrors the backend's position rows (GET /api/positions). `employeeCount` is the number of
 *  staff currently assigned this position — shown on the department detail screen and linked
 *  through to the filtered Nhân sự list. */
export type Position = {
  id: string
  code: string
  name: string
  department: Department
  employeeCount: number
}
