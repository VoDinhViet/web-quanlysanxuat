import type { FileResource } from "@/lib/types/file.type"
import type { RoleRef } from "@/lib/types/role.type"

export type Gender = "MALE" | "FEMALE" | "OTHER"

export const genderLabels: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
}

export type EmployeeStatus = "WORKING" | "RESIGNED"

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  WORKING: "Đang làm việc",
  RESIGNED: "Đã nghỉ việc",
}

import type { Department } from "@/lib/types/department.type"
import type { Position } from "@/lib/types/position.type"

/** Mirrors the credential summary nested in the backend's UserResDto. */
export type UserCredential = {
  id: string
  username: string
  email: string
  /** Role assigned to this login identity, or null if none. */
  role: RoleRef | null
}

/** Mirrors the backend's UserResDto (GET /users, GET /users/:userId). */
export type User = {
  id: string
  code: string
  fullName: string
  gender: Gender
  dateOfBirth: string | null
  idNumber: string | null
  phoneNumber: string | null
  email: string | null
  address: string | null
  avatar: FileResource | null
  department: Department
  position: Position
  hireDate: string
  note: string | null
  status: EmployeeStatus
  credential: UserCredential | null
  createdAt: string
  updatedAt: string
}
