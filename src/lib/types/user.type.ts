import type { FileResource } from "@/lib/types/file.type"
import type { RoleRef } from "@/lib/types/role.type"

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export const USER_GENDER_LABELS: Record<UserGender, string> = {
  [UserGender.MALE]: "Nam",
  [UserGender.FEMALE]: "Nữ",
  [UserGender.OTHER]: "Khác",
}

export enum EmployeeStatus {
  WORKING = "WORKING",
  RESIGNED = "RESIGNED",
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.WORKING]: "Đang làm việc",
  [EmployeeStatus.RESIGNED]: "Đã nghỉ việc",
}

/** Mirrors the backend's department rows (GET /api/departments). */
export type Department = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's position rows (GET /api/positions). */
export type Position = {
  id: string
  code: string
  name: string
  department: Department
}

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
  gender: UserGender
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
