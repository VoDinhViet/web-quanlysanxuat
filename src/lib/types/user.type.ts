import type { Department } from "@/lib/types/department.type"
import type { FileResource } from "@/lib/types/file.type"
import type { Position } from "@/lib/types/position.type"
import type { RoleRef } from "@/lib/types/role.type"

/** Mirrors the backend's UserRefResDto (GET /users/options). */
export type UserRef = {
  id: string
  code: string
  fullName: string
}

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

/** Mirrors the credential summary nested in the backend's UserResDto. */
export type UserCredential = {
  id: string
  username: string
  email: string
  credentialEnabled: boolean
  /** Role assigned to this login identity, or null if none. */
  role: RoleRef | null
}

/** Mirrors the backend's UserResDto (GET /users/:userId) — the detail shape. Note there is no
 *  `email` here: login email lives on `credential.email`, `users` carries no email column. */
export type User = {
  id: string
  code: string
  fullName: string
  gender: Gender
  dateOfBirth: string | null
  idNumber: string | null
  phoneNumber: string | null
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

/** Mirrors the backend's PageUserResDto (GET /users) — the list shape, distinct from `User`:
 *  flat `email`/`role` (read off the joined credential row) instead of a nested `credential`. */
export type UserListItem = {
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
  role: RoleRef | null
  hireDate: string
  note: string | null
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}
