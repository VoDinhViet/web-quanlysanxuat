export const USER_GENDERS = ["MALE", "FEMALE", "OTHER"] as const
export type UserGender = (typeof USER_GENDERS)[number]

export const USER_GENDER_LABELS: Record<UserGender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
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
export type DepartmentOption = {
  id: string
  code: string
  name: string
}

/** Mirrors the backend's position rows (GET /api/positions). */
export type PositionOption = {
  id: string
  code: string
  name: string
}

/** Mirrors the credential summary nested in the backend's UserResDto. */
export type UserCredential = {
  id: string
  username: string
  email: string
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
  avatarUrl: string | null
  department: DepartmentOption
  position: PositionOption
  hireDate: string
  note: string | null
  status: EmployeeStatus
  credential: UserCredential | null
  createdAt: string
  updatedAt: string
}
