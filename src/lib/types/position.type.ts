import type { Department } from "@/lib/types/department.type"

/** Mirrors the backend's position rows (GET /api/positions). */
export type Position = {
  id: string
  code: string
  name: string
  department: Department
}
